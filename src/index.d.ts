export type Options = {
  isDebug?: boolean;
  changeSource?: (source: string) => string;
  expand?: {
    [key: string]: boolean | undefined;
  };
};
