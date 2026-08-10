import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  entries: ['src/index.js'],
  clean: true,
  declaration: true,
  rollup: {
    emitCJS: true
  }
})
