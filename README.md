# rush-cache

基于 Rush 的 Monorepo 示例项目，演示多包管理、workspace 依赖引用以及构建缓存（Build Cache）的完整实践，**同时支持 `local-only` 本地磁盘缓存和 `http` 远程缓存两种模式**。

> 在线预览：http://111.229.185.119:8085/

## 项目简介

本项目使用 [Rush](https://rushjs.io/) 管理 Monorepo，包含 3 个子包，通过 `workspace:*` 协议实现本地包互相引用：

| 包名 | 目录 | 说明 | 构建工具 |
|------|------|------|----------|
| `my-app` | `my-app/` | Vue 3 主应用，引用 components 和 tools | Vite |
| `my-components` | `components/` | Vue 3 组件库，对外导出 HelloWorld 组件 | Vite |
| `my-tools` | `tools/` | 工具函数库，提供 isNumber、isObject 等类型判断方法 | unbuild |

### 依赖关系

```
my-app
 ├── my-components (workspace:*)  -> HelloWorld 组件
 └── my-tools (workspace:*)       -> isNumber 等工具函数
```

### 技术栈

- **Monorepo 管理**：Rush 5.125.1 + pnpm 7.33.5
- **前端框架**：Vue 3.5
- **构建工具**：Vite 6 / unbuild 2
- **构建缓存**：支持 `local-only`（本地磁盘）与 `http`（自建 HTTP 服务）两种模式，可平滑扩展到云端（S3 / Azure Blob）

## 项目结构

```
rush-cache/
├── common/
│   └── config/rush/
│       ├── build-cache.json          # 构建缓存配置（切换 local-only / http）
│       ├── command-line.json         # 自定义命令配置
│       ├── common-versions.json      # 统一版本管理
│       └── pnpm-lock.yaml            # pnpm 锁文件
├── my-app/                           # Vue 主应用
│   ├── config/rush-project.json      # 项目级缓存配置
│   ├── src/
│   │   ├── App.vue                   # 引用 my-components 和 my-tools
│   │   ├── main.js                   # 应用入口
│   │   └── components/HelloWorld.vue
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── components/                       # Vue 组件库
│   ├── config/rush-project.json
│   ├── src/
│   │   ├── index.js                  # 导出 HelloWorld
│   │   └── components/HelloWorld.vue
│   ├── vite.config.js
│   └── package.json
├── tools/                            # 工具函数库
│   ├── config/rush-project.json
│   ├── build.config.ts               # unbuild 配置
│   ├── index.js                      # 类型判断工具函数
│   └── package.json
├── server/                           # HTTP 构建缓存服务（http 模式专用）
│   ├── index.js                      # 基于 Node 原生 http 模块的缓存服务
│   ├── package.json
│   └── rush-build-cache/             # 缓存文件存储目录（自动创建）
├── rush.json                         # Rush 主配置
└── package.json
```

## 环境要求

- Node.js >= 16.13.0（推荐 18 LTS）
- 全局安装 Rush：

```bash
npm install -g @microsoft/rush
```

## 程序启动过程

### 1. 安装依赖

克隆项目后，使用 Rush 统一安装所有子包的依赖：

```bash
rush update
```

该命令会根据 `common/config/rush/pnpm-lock.yaml` 安装依赖，并自动建立 `workspace:*` 的本地软链接。

### 2. （可选）启动 HTTP 缓存服务

> 仅当 `build-cache.json` 中 `cacheProvider` 配置为 `"http"` 时需要执行此步骤；如果使用 `"local-only"` 模式可直接跳过。

```bash
cd server
node index.js
```

服务默认运行在 `http://localhost:3000/`，缓存文件保存在 `server/rush-build-cache/`。可通过 `PORT` 环境变量修改端口：

```bash
PORT=4000 node server/index.js
```

启动成功后会输出：

```
Rush build cache server running at http://localhost:3000/
Cache directory: .../server/rush-build-cache
```

### 3. 构建所有项目

```bash
rush build
```

Rush 会按照依赖拓扑顺序（`my-tools` -> `my-components` -> `my-app`）依次构建：

```
my-tools       -> unbuild 构建，输出到 dist/
my-components  -> vite build 构建，输出到 dist/
my-app         -> vite build 构建，输出到 dist/
```

> 如果开启了构建缓存且缓存命中，Rush 会直接从缓存（本地磁盘或 HTTP 服务）还原 `dist/` 目录，跳过实际构建。

### 4. 启动开发服务器

构建完成后，进入 `my-app` 启动开发服务器：

```bash
cd my-app
rushx dev
```

或者不切换目录：

```bash
rushx --to my-app dev
```

浏览器访问 `http://localhost:5173`，可以看到：

- 页面显示：`这是 my-components 组件：my-app`
- 控制台输出：
  ```
  isNumber true
  isNumber false
  ```

### 5. 单独构建某个子包

```bash
# 只构建 my-tools
rush build --to my-tools

# 只构建 my-app 及其依赖
rush build --to my-app

# 从某个包开始往后构建
rush build --from my-tools
```

### 6. 清理与重建

```bash
# 清理所有构建产物和临时文件（不清理 http server 的缓存）
rush purge

# 强制重新构建（忽略缓存读取，但仍会写入缓存）
rush rebuild
```

## 构建缓存

本项目同时支持两种构建缓存模式，可通过修改 `common/config/rush/build-cache.json` 中的 `cacheProvider` 字段切换。

### 模式一：local-only（本地磁盘缓存）

最简单的模式，缓存文件保存在 `common/temp/build-cache/`，仅当前机器可用。

`build-cache.json` 配置：

```json
{
  "buildCacheEnabled": true,
  "cacheProvider": "local-only"
}
```

特点：
- 零基础设施成本，开箱即用
- 仅同一台机器可复用，切换分支后仍可命中
- 适合个人开发或初次体验构建缓存

### 模式二：http（远程 HTTP 缓存）

通过自建 HTTP 服务集中存储缓存，支持团队共享。本项目在 `server/index.js` 提供了一个最小化实现。

`build-cache.json` 配置：

```json
{
  "buildCacheEnabled": true,
  "cacheProvider": "http",
  "httpConfiguration": {
    "url": "http://localhost:3000/",
    "isCacheWriteAllowed": true
  }
}
```

特点：
- 缓存集中存储，团队成员可共享缓存命中
- 支持通过 `isCacheWriteAllowed` 配合环境变量 `RUSH_BUILD_CACHE_WRITE_ALLOWED` 控制 CI 中的写入权限
- 可平滑替换为 nginx、CDN 或商业缓存服务

每个子包通过 `config/rush-project.json` 声明构建产物目录（两种模式通用）：

```json
{
  "operationSettings": [
    {
      "operationName": "build",
      "outputFolderNames": ["dist"]
    }
  ]
}
```

详细的构建缓存配置、原理、CI 集成、踩坑指南请参考 [docs/rush-build-cache-guide.md](docs/rush-build-cache-guide.md)。

## 缓存写入权限控制

通过环境变量 `RUSH_BUILD_CACHE_WRITE_ALLOWED` 可在运行时控制是否允许写入缓存，常用于 CI 场景：

| 场景 | 推荐设置 | 效果 |
|------|----------|------|
| 本地开发 | 不设置（跟随 `isCacheWriteAllowed` 配置） | 默认写入 |
| CI 主分支构建 | `RUSH_BUILD_CACHE_WRITE_ALLOWED=1` | 写入缓存，供团队复用 |
| CI PR 构建 | `RUSH_BUILD_CACHE_WRITE_ALLOWED=0` | 只读缓存，避免污染 |

```bash
# CI 主分支构建示例
RUSH_BUILD_CACHE_WRITE_ALLOWED=1 rush build

# CI PR 构建示例（只读）
RUSH_BUILD_CACHE_WRITE_ALLOWED=0 rush build
```

## 常用命令

| 命令 | 说明 |
|------|------|
| `rush install` | 安装依赖 |
| `rush update` | 更新依赖（会修改 lockfile） |
| `rush build` | 增量构建（优先读缓存） |
| `rush rebuild` | 强制全量重建（写入缓存） |
| `rush purge` | 清理所有临时文件和构建产物 |
| `rushx dev` | 在当前项目目录启动 dev server |
| `rush list` | 列出所有项目及依赖关系 |
| `node server/index.js` | 启动 HTTP 构建缓存服务（http 模式专用） |

## 相关文档

- [Rush 官方文档](https://rushjs.io/)
- [构建缓存配置完全指南](docs/rush-build-cache-guide.md)

## License

ISC
