# vite-plugin-conditional-compile

参考至:  <https://github.com/hzsrc/js-conditional-compile-loader>

一个条件编译的 `vite` 插件, 根据不同的项目环境定制不同版本的代码

## Options

name         | default                         | type    |   require        | description
----         | ----                            | ----    |    ----          | ----
isDebug      | config.command === 'server'     | boolean |    否             | 是否为开发环境
changeSource | -                               | (str:string) => string | 否 | 对原代码进行处理的函数
expand       | -                               | {[key]:string:boolean} | 否 | 模式的拓展项. 启动 vite 项目时存在 --mode 的 options.当项目以 --mode coverage 启动时, 这时vite 中 config 的 mode === 'coverage', 此时可以给 expand 设置一个任意 key(与注释内容中的后部分相同, 此例中为 isCoverage), /*IFTRUE_isCoverage*/ doSomething /*FITRUE_isCoverage*/, 当值为 true 时, doSomething 这段代码才会存在于环境中.

## example

`vite.config`

```typescript
import vitePluginConditionalCompile from 'vite-plugin-conditional-compile';

export default defineConfig((config) => {
  //...
 plugins: [vitePluginConditionalCompile({})]
  //...
}

```

`package.json`

```json
  {
    "scripts":{
      "start": "vite",
      "build": "vite build"
    }
  }
```

`index.tsx`

``` typescript

/* IFTRUE_isDebug */
import from 'doSomething.js'
/* FITRUE_isDebug */

```

`index.tsx` 中的这段 `import` 语句只会在开发环境中存在, 不会被打包进生产环境中.

## 拓展项

`vite.config`

```typescript
import vitePluginConditionalCompile from 'vite-plugin-conditional-compile';

export default defineConfig((config) => {
  //...
const isCoverage = config.mode === 'coverage';
 plugins: [vitePluginConditionalCompile({
   expand:{
     isCoverage
   }
 })]
  //...
}

```

`package.json`

```json
  {
    "scripts":{
      "start": "vite",
      "build": "vite build",
      "coverage-build": "npm run build --mode coverage",
    }
  }
```

`index.tsx`

``` typescript

/* IFTRUE_isCoverage */
import from 'doSomething.js'
/* FITRUE_isCoverage */

```

`index.tsx` 中的这段 `import` 语句将只会在 `mode` 为 `coverage` 的时候存在环境中, 也就是执行 `npm run coverage-build`, 需要保证的是注释中的后半部分内容与 `expand` 中的 `key` 值相对应.
