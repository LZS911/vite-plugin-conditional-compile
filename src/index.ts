import { loadEnv, Plugin } from 'vite';
import { create_context } from './core';
import { Options } from './index.d';

const vitePluginConditionalCompile: (userOptions: Options) => Plugin = (userOptions = {}) => {
  const ctx = create_context(userOptions);
  return {
    name: 'vite-plugin-conditional-compile',
    enforce: 'pre',
    configResolved(config) {
      ctx.set_env({
        ...loadEnv(config.mode ?? process.env.NODE_ENV, process.cwd(), ''),
        ...config.env,
      });
    },
    transform(code, id) {
      return ctx.transform(code, id);
    },
  };
};

export default vitePluginConditionalCompile;
