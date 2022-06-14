# vite-plugin-conditional-compile

参考至:  <https://github.com/hzsrc/js-conditional-compile-loader>

一个条件编译的 `vite` 插件, 根据不同的项目环境定制不同版本的代码

使用方式: 通过一段注释包裹代码, 通过配置来控制是否编译该段代码, 详细见下面示例.

## Options

name         | default                         | type    |   require        | description
----         | ----                            | ----    |    ----          | ----
isDebug      | config.command === 'server'     | boolean |    否             | 是否为开发环境
changeSource | -                               | (str:string) => string | 否 | 对原代码进行处理的函数
expand       | -                               | {[key:string]:boolean} | 否 | 键为自定义字符, 用来确定包裹代码的注释(确定方式见示例), 值为bool类型, 当为true时才会编译注释包裹的源代码

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
