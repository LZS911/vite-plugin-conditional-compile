import { PluginOption } from 'vite';

export type Options = {
  isDebug?: boolean;
  changeSource?: (source: string) => string;
  expand?: {
    [key: string]: boolean | undefined;
  };
};

declare function vitePluginConditionalCompile(opts?: Options): PluginOption[];

export default vitePluginConditionalCompile;
