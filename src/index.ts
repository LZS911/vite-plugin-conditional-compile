import { Plugin, ResolvedConfig } from 'vite';
import { Options } from './index.d';

const vitePluginConditionalCompile: (userOptions: Options) => Plugin = (userOptions = {}) => {
  let config: ResolvedConfig;
  return {
    name: 'vite-plugin-conditional-compile',
    enforce: 'pre',
    configResolved(resolvedConfig) {
      config = resolvedConfig;
    },
    transform(code, id) {
      if (!('isDebug' in userOptions)) {
        userOptions.isDebug = config.command === 'serve'; //默认的isDebug
      }
      try {
        if (userOptions.changeSource && typeof userOptions.changeSource === 'function') {
          return replaceMatched(userOptions.changeSource(code), userOptions);
        }
      } catch (error) {
        throw error;
      }

      return replaceMatched(code, userOptions);
    },
  };
};

const replaceMatched = (js: string, userOptions: Options): string => {
  const REG = /\/\*\s*IF(DEBUG|TRUE_\w+)(?:\s*\*\/)?([\s\S]+?)(?:\/\*\s*)?FI\1\s*\*\//g;
  return js.replace(REG, (_, $1, $2) => {
    //_: 匹配到的所有字符
    //$1:  注释的开头内容
    //$2: 被注释包含的内容, 即代码部分
    const matchStr = $1.slice(5);
    let isKeep = false;
    if (matchStr === 'isDebug') {
      isKeep = userOptions.isDebug!;
    } else {
      isKeep = !!userOptions.expand?.[matchStr];
    }

    // 当与当前模式匹配上时保留代码部分, 否则替换为空字符串
    return isKeep ? replaceMatched($2, userOptions) : '';
  });
};

export default vitePluginConditionalCompile;
