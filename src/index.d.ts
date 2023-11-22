import { FilterPattern, PluginOption } from 'vite';

export type Options = {
  include?: FilterPattern;
  exclude?: FilterPattern;
  env?: Record<string, any>;

  /**
   * @deprecated
   */
  isDebug?: boolean;
  /**
   * @deprecated
   */
  changeSource?: (source: string) => string;
  /**
   * @deprecated
   */
  expand?: {
    [key: string]: boolean | undefined;
  };
};

declare function vitePluginConditionalCompile(opts?: Options): PluginOption[];

export default vitePluginConditionalCompile;
