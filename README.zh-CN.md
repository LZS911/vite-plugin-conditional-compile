
<h2 align='center'>vite-plugin-conditional-compile</h2>

<p align="center">这是一个 Vite 插件，用于实现条件编译的功能，类似于 C/C++ 中的条件编译预处理指令。</p>

[English](./README.md) | 简体中文 | [1.3.x旧版本](./README.OLD.md)

## 功能特性

- 支持根据自定义的条件配置选择性地包含或排除代码块
- 可以在开发环境和生产环境中使用不同的代码逻辑
- 灵活的条件表达式，支持逻辑运算和环境变量
- 可以在 Vite 构建过程中动态生成不同的输出文件

## 安装

```ssh
yarn add vite-plugin-conditional-compile -D
```

## 使用

>务必将该插件的加载顺序放在最前位，防止 jsx 之类的代码被其他插件编译，导致本插件无法解析

```js
// vite.config.ts
import { defineConfig } from "vite";
import vitePluginConditionalCompile from "vite-plugin-conditional-compile";

export default defineConfig({
    plugins: [vitePluginConditionalCompile({
      // 插件配置项...
    }),
    // 其他插件...
  ],
});
```

## 配置项

该插件支持以下配置项：

1. `include: string | RegExp | readonly (string | RegExp)[] | null`
   需要进行条件编译的文件路径或文件匹配模式。

   默认值: `['**/*']`

   示例：

   ```js
      {
        include: [/^.+\/packages\/.+\/.+.(ts|tsx)$/],
      }
   ```

2. `exclude: string | RegExp | readonly (string | RegExp)[] | null`
   需要排除条件编译的文件路径或文件匹配模式。

   默认值: `[/[\\/]node_modules[\\/]/, /[\\/]\.git[\\/]/]`

   示例：

   ```js
      {
         exclude: ['/\.eslintrc.js/']
      }
   ```

3. `env: Record<string, any>`
    自定义环境变量选项，用于在条件编译语句中使用自定义的环境变量。示例：

    ```javascript
    {
      'MY_VARIABLE': 'my value',
      // 更多自定义环境变量...
    }
    ```

    同时，本插件会调用 vite 提供的 [loadEnv](https://vitejs.dev/guide/api-javascript.html#loadenv) 来获取项目的环境变量。

## 示例

```javascript
// vite.config.ts
import { defineConfig } from "vite";
import vitePluginConditionalCompile from "vite-plugin-conditional-compile";

export default defineConfig({
    plugins: [vitePluginConditionalCompile({
      env:{
        //自定义环境变量, 提供给条件语句使用
        feature: 'code',
        prod_version: 'vite'
      }
    }),
  ],
});


// main.jsx
// #if [DEV]
import { featureA } from './featureA.js';

// 这里的 PROD 取至 项目的环境变量, 若当前为生产环境时将加载此条 import 语句
// #elif [PROD]
import { featureB } from './featureB.js';

//这里的 feature 和 prod_version 取至用户的 env 配置项, 判断 feature 的值是否与 ”code“ 相同、prod_version的值是否不等于 ”vite“. 当满足其中之一时, 该条件成立
// #elif [feature=code || !(prod_version=vite)]
import { featureC } from './featureC.js';

// #else
import { featureD } from './featureD.js';

// #endif

// #if [DEV]
console.log('Development environment');
// #endif

// #if [PROD]
console.log('Production environment');
// #endif

// #if [!!API_URL]
fetch(import.meta.env.API_URL)
  .then(response => response.json())
  .then(data => console.log(data));
// #endif

const Com = () => {
return (
    <div>
      {/* #if [PROD] */}
      <span>prod mode</span>
      {/* #elif [DEV] */}
      <span>dev mode</span>
      {/*#else */}
      <span>unknown mode</span>
      {/* #endif */}
    </div>
  );
}
```

## 支持的条件语句

> 注: 条件需要使用 [] 进行包裹

1. 等式: `feature=code`、`prod_version=4.5.0` 等式右侧支持字符以及数字类型。
2. 不等式: `prod_version != vite`。
3. 逻辑语句: `feature=code || !(prod_version=vite)` 支持嵌套逻辑语句。
4. 变量: `DEV` 判断 env['DEV'] 的值是否为 true。
5. 取反符号: `!PROD` 判断 env['PROD'] 的值是否为 false，可以使用双重取反来模拟 #ifdef。

## VS Code 插件

后续将会支持 VS Code插件来高亮条件以及语法校验等功能。
