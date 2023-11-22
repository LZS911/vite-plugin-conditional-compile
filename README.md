<h2 align='center'>vite-plugin-conditional-compile</h2>

<p align="center">This is a Vite plugin that enables conditional compilation, similar to conditional compilation directives in C/C++.</p>

English | [简体中文](./README.zh-CN.md) | [1.3.x旧版本](./README.OLD.md)

# Features

1. Supports selectively including or excluding code blocks based on custom condition configurations.
2. Allows using different code logic in development and production environments.
3. Flexible condition expressions with support for logical operations and environment variables.
4. Can dynamically generate different output files during the Vite build process.

## Installation

```ssh
yarn add  vite-plugin-conditional-compile -D
```

## Usage

>Be sure to place this plugin's loading order at the forefront to prevent other plugins from compiling code like jsx, which would cause this plugin to fail to parse.

## Configuration Options

This plugin supports the following configuration options:

1. `include: string | RegExp | readonly (string | RegExp)[] | null`
   Specifies the file paths or file matching patterns that should undergo conditional compilation.

   Example:

   ```js
      {
        include: [/^.+\/packages\/.+\/.+.(ts|tsx)$/],
      }
   ```

2. `exclude: string | RegExp | readonly (string | RegExp)[] | null`
   Specifies the file paths or file matching patterns to exclude from conditional compilation.

   Example:

   ```js
      {
         exclude: ['**/node_modules/**']
      }
   ```

3. `env: Record<string, any>`
    Custom environment variable options used in conditional compilation statements with custom environment variables.

    Example:

    ```javascript
    {
      'MY_VARIABLE': 'my value',
      // more env options...
    }
    ```

    Additionally, this plugin calls vite's  [loadEnv](https://vitejs.dev/guide/api-javascript.html#loadenv) to retrieve the project's environment variables.

## Examples

```javascript
// vite.config.ts
import { defineConfig } from "vite";
import vitePluginConditionalCompile from "vite-plugin-conditional-compile";

export default defineConfig({
    plugins: [vitePluginConditionalCompile({
      env:{
        feature: 'code',
        prod_version: 'vite'
      }
    }),
  ],
});


// main.jsx
// #if [DEV]
import { featureA } from './featureA.js';

// #elif [PROD]
import { featureB } from './featureB.js';

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

## Supported Conditional Statements

>Note: Conditions should be wrapped in square brackets []

1. Equality: `feature=code`、`prod_version=4.5.0` Supports characters and numeric values on the right side of the equation.
2. Inequality: `prod_version != vite`
3. Logical statements: `feature=code || !(prod_version=vite)`. Supports nested logical statements.
4. Variables: `DEV`. checks if the value of env['DEV'] is true.
5. Negation: `!PROD`. checks if the value of env['PROD'] is false. Double negation can be used to simulate #ifdef.

## VS Code Extension

In the future, there will be support for a VS Code extension that provides features such as syntax highlighting for conditions and syntax validation.
