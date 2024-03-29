import {
  parseAsync,
  traverse,
  transformAsync as babelTransformAsync,
  ParserOptions,
} from '@babel/core';
import { createFilter } from 'vite';
import { Options } from '../index.d';
import { logger } from './logger';
import {
  BinaryExpression,
  Identifier,
  LogicalExpression,
  NumericLiteral,
  UnaryExpression,
  ExpressionStatement,
} from '@babel/types';
import replaceAsync from 'string-replace-async';

type SourceMap = {
  file: string;
  mappings: string;
  names: string[];
  sources: string[];
  sourcesContent?: string[] | undefined;
  version: number;
  toString(): string;
};

type ConditionalSupportType =
  | BinaryExpression
  | Identifier
  | LogicalExpression
  | NumericLiteral
  | UnaryExpression;

class Context {
  private ctx: Options = {} as Options;
  private code: string = '';
  private filepath: string = '';
  private root: string = '';
  private enable_source_maps: boolean = false;

  public sourceMapFileNameReg = /\.[tj]sx?$/;
  private tsReg = /\.tsx?$/;

  public pattern_reg =
    /(?:\/\/|\{?\s*\/\*|<!--)\s*#\s*if\s\[([\w!=&|()'"\s]+)\]\s*(?:\*\/\s*\}?|-->)?([\s\S]+?)(?:\/\/|\{?\s*\/\*|<!--)\s*#\s*endif\s*(?:\*\/\s*\}?|-->)?/g;

  public match_group_reg =
    /.*(#\s*(?:if|elif|else|endif))\s?(?:\[([\w !=&|()'"]*)\])*(?:\s*\*\/\s*\}?|\s*-->)?/g;
  constructor(userOptions: Options) {
    this.ctx = userOptions;
  }

  public set_env(env: Record<string, any>) {
    this.ctx.env = { ...env, ...this.ctx.env };
  }

  public set_root(root: string) {
    this.root = root;
  }

  public set_enable_source_maps(enable: boolean) {
    this.enable_source_maps = enable;
  }

  public resolve_options(userOptions: Options) {
    return {
      include: ['**/*'],
      exclude: [/[\\/]node_modules[\\/]/, /[\\/]\.git[\\/]/],
      ...userOptions,
    };
  }

  public evaluate_ast(node: ConditionalSupportType): boolean {
    try {
      if (node.type === 'BinaryExpression') {
        const { left, operator, right } = node;
        if (left.type === 'Identifier' && ['==', '!='].includes(operator)) {
          if (right.type === 'Identifier') {
            if (operator === '==') {
              return this.ctx.env?.[left.name] == right.name;
            }
            return this.ctx.env?.[left.name] != right.name;
          }

          if (right.type === 'NumericLiteral') {
            if (operator === '==') {
              return this.ctx.env?.[left.name] == right.value;
            }
            return this.ctx.env?.[left.name] != right.value;
          }
        } else {
          logger.error(
            `evaluate ast error: This expression is not supported: ${left.type}${operator}${right.type}`,
          );
          return false;
        }
      }
      if (node.type === 'Identifier') {
        return this.ctx.env?.[node.name] === true;
      }

      if (node.type === 'NumericLiteral') {
        return this.ctx.env?.[node.value] === true;
      }

      if (node.type === 'UnaryExpression') {
        if (node.operator === '!') {
          if (node.argument.type === 'Identifier') {
            return !this.ctx.env?.[node.argument.name];
          }
          if (node.argument.type === 'UnaryExpression') {
            return !this.evaluate_ast(node.argument);
          }
          if (node.argument.type === 'BinaryExpression') {
            return !this.evaluate_ast(node.argument);
          }
          logger.error(
            `evaluate ast error: This expression is not supported: ${node.type}:${node.operator}`,
          );
          return false;
        } else {
          logger.error(
            `evaluate ast error: This expression is not supported: ${node.type}:${node.operator}`,
          );
          return false;
        }
      }

      if (node.type === 'LogicalExpression') {
        const { left, operator, right } = node;

        if (operator === '&&') {
          return (
            this.evaluate_ast(left as ConditionalSupportType) &&
            this.evaluate_ast(right as ConditionalSupportType)
          );
        }
        if (operator === '||') {
          return (
            this.evaluate_ast(left as ConditionalSupportType) ||
            this.evaluate_ast(right as ConditionalSupportType)
          );
        }
        if (operator === '??') {
          return (
            this.evaluate_ast(left as ConditionalSupportType) ??
            this.evaluate_ast(right as ConditionalSupportType)
          );
        }
      }

      logger.error(`evaluate ast error: This expression is not supported: ${node.type}`);
      return false;
    } catch (error) {
      logger.error(`evaluate ast error: ${error}`);
      return false;
    }
  }

  public async resolve_conditional_async(conditional: string): Promise<boolean> {
    let res = false;
    try {
      const ast = await parseAsync(conditional.replace(/([^=!])=([^=])/g, '$1==$2'));
      if (!ast) {
        return false;
      }

      traverse(ast, {
        Program: ({ node }) => {
          res = this.evaluate_ast(
            (node.body[0] as ExpressionStatement).expression as ConditionalSupportType,
          );
        },
      });
    } catch (error) {
      logger.error(`${this.filepath}: babel parse error: ${error}`);
      return false;
    }
    return res;
  }

  public async resolve_comment_async() {
    return replaceAsync(this.code, this.pattern_reg, async (matchCode) => {
      const codeBlocks = matchCode.split(this.match_group_reg).filter((v) => v !== '');
      while (codeBlocks.length) {
        const [flag, conditional, block] = codeBlocks.splice(0, 3);
        const real_flag = flag.replace(/\s/g, '');
        if (real_flag === '#if' || real_flag === '#elif') {
          if (await this.resolve_conditional_async(conditional)) {
            return block;
          }
        } else if (real_flag === '#else') {
          return block;
        }
      }

      return '';
    });
  }

  public deprecated_transform(code: string) {
    if (!('isDebug' in this.ctx)) {
      this.ctx.isDebug = !!this.ctx.env?.DEV;
    }
    try {
      const js = this.ctx?.changeSource?.(code) ?? code;
      const replaceMatched = (): string => {
        const REG = /\/\*\s*IF(DEBUG|TRUE_\w+)(?:\s*\*\/)?([\s\S]+?)(?:\/\*\s*)?FI\1\s*\*\//g;
        return js.replace(REG, (_, $1, $2) => {
          let isKeep = false;
          if ($1 === 'DEBUG') {
            isKeep = this.ctx.isDebug!;
          } else {
            isKeep = !!this.ctx.expand?.[$1.slice(5)];
          }

          return isKeep ? $2 : '';
        });
      };

      return replaceMatched();
    } catch (error) {
      throw error;
    }
  }

  public async transformAsync(
    code: string,
    id: string,
  ): Promise<{ code?: string; map?: SourceMap | null } | undefined> {
    if (id.includes('/node_modules/')) return;

    const [filepath] = id.split('?');

    this.code = code;
    this.filepath = filepath;

    const options = this.resolve_options({ include: this.ctx.include, exclude: this.ctx.exclude });
    const filter = createFilter(options.include, options.exclude);
    let transformedCode = '';
    if (!filter(this.filepath)) {
      transformedCode = this.deprecated_transform(code);
    } else {
      transformedCode = this.deprecated_transform(await this.resolve_comment_async());
    }

    if (!this.enable_source_maps || !this.sourceMapFileNameReg.test(this.filepath)) {
      return {
        code: transformedCode,
        map: null,
      };
    }

    try {
      const parserPlugins: ParserOptions['plugins'] = [];

      if (!this.filepath.endsWith('.ts')) {
        parserPlugins.push('jsx');
      }

      if (this.tsReg.test(this.filepath)) {
        parserPlugins.push('typescript');
      }
      const babelTransformed = await babelTransformAsync(transformedCode, {
        root: this.root,
        filename: id,
        sourceFileName: this.filepath,
        parserOpts: {
          sourceType: 'module',
          allowAwaitOutsideFunction: true,
          plugins: parserPlugins,
        },
        generatorOpts: {
          decoratorsBeforeExport: true,
        },
        sourceMaps: true,
      });

      return {
        code: babelTransformed?.code ?? undefined,
        map: babelTransformed?.map,
      };
    } catch (error) {
      logger.error(`${this.filepath}: generate source maps error: ${error}`);
      return {
        code: transformedCode,
        map: null,
      };
    }
  }
}

export const create_context = (userOptions: Options) => {
  return new Context(userOptions);
};
