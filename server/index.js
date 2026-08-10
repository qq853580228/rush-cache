const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const CACHE_DIR = path.join(__dirname, 'rush-build-cache');

// 确保缓存目录存在
if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
}

const server = http.createServer((req, res) => {
  // 设置 CORS 头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // 处理 CORS 预检请求
  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    res.end();
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host}`);
  const cacheKey = url.pathname.replace(/^\//, '');

  if (!cacheKey) {
    res.statusCode = 400;
    res.end('Cache key is required');
    return;
  }

  const cacheFilePath = path.join(CACHE_DIR, cacheKey);

  // 安全检查：确保路径在缓存目录内
  if (!cacheFilePath.startsWith(CACHE_DIR)) {
    res.statusCode = 403;
    res.end('Access denied');
    return;
  }

  switch (req.method) {
    case 'GET':
      // 读取缓存
      fs.readFile(cacheFilePath, (err, data) => {
        if (err) {
          if (err.code === 'ENOENT') {
            res.statusCode = 404;
            res.end('Cache not found');
          } else {
            res.statusCode = 500;
            res.end('Internal server error');
          }
          return;
        }
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/octet-stream');
        res.end(data);
      });
      break;

    case 'PUT':
    case 'POST':
    case 'PATCH':
      // 写入缓存
      const dir = path.dirname(cacheFilePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      const writeStream = fs.createWriteStream(cacheFilePath);
      req.pipe(writeStream);

      writeStream.on('finish', () => {
        res.statusCode = 200;
        res.end('Cache written successfully');
      });

      writeStream.on('error', (err) => {
        console.error('Error writing cache:', err);
        res.statusCode = 500;
        res.end('Failed to write cache');
      });
      break;

    case 'DELETE':
      // 删除缓存
      fs.unlink(cacheFilePath, (err) => {
        if (err) {
          if (err.code === 'ENOENT') {
            res.statusCode = 404;
            res.end('Cache not found');
          } else {
            res.statusCode = 500;
            res.end('Internal server error');
          }
          return;
        }
        res.statusCode = 200;
        res.end('Cache deleted successfully');
      });
      break;

    default:
      res.statusCode = 405;
      res.end('Method not allowed');
  }
});

server.listen(PORT, () => {
  console.log(`Rush build cache server running at http://localhost:${PORT}/`);
  console.log(`Cache directory: ${CACHE_DIR}`);
});
