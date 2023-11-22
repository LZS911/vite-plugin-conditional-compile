import { parseSync, traverse } from '@babel/core';
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

type ConditionalSupportType =
  | BinaryExpression
  | Identifier
  | LogicalExpression
  | NumericLiteral
  | UnaryExpression;

class Context {
  private ctx: Options = {} as Options;
  private code: string = '';
  private id: string = '';

  constructor(userOptions: Options) {
    this.ctx = userOptions;
  }

  public set_env(env: Record<string, any>) {
    this.ctx.env = { ...this.ctx.env, ...env };
  }

  public resolve_options(userOptions: Options) {
    return {
      include: ['**/*'],
      exclude: [/[\\/]node_modules[\\/]/, /[\\/]\.git[\\/]/],
      ...userOptions,
    };
  }

  public evaluate_ast(node: ConditionalSupportType): boolean {
    console.log(node);
    try {
      if (node.type === 'BinaryExpression') {
        const { left, operator, right } = node;
        if (left.type === 'Identifier' && ['==', '!=='].includes(operator)) {
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
            return this.ctx.env?.[node.argument.name] === false;
          }
          if (node.argument.type === 'UnaryExpression') {
            return this.evaluate_ast(node.argument);
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

  public resolve_conditional(conditional: string): boolean {
    let res = false;
    try {
      const ast = parseSync(conditional.replace(/([^=!])=([^=])/g, '$1==$2'));
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
      logger.error(`${this.id}: babel parse error: ${error}`);
      return false;
    }
    return res;
  }

  public resolve_comment() {
    const pattern_reg =
      /(?:\/\/|\{?\/\*)\s*#\s*if\s\[([\w!=&|()'"\s]+)\](?:\s*\*\/\}?)?([\s\S]+?)(?:\/\/|\{?\/\*)\s*#\s*endif(?:\s*\*\/\}?)?/g;

    return this.code.replace(pattern_reg, (matchCode) => {
      const match_group_reg =
        /.*(#\s*(?:if|elif|else|endif))\s?(?:\[([\w !=&|()'"]*)\])*(?:\s*\*\/\s*\})?/g;
      const codeBlocks = matchCode.split(match_group_reg).filter((v) => v !== '');
      while (codeBlocks.length) {
        const [flag, conditional, block] = codeBlocks.splice(0, 3);
        const real_flag = flag.replace(/\s/g, '');
        if (real_flag === '#if' || real_flag === '#elif') {
          if (this.resolve_conditional(conditional)) {
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

  public transform(code: string, id: string) {
    this.code = code;
    this.id = id;

    const options = this.resolve_options({ include: this.ctx.include, exclude: this.ctx.exclude });
    const filter = createFilter(options.include, options.exclude);
    if (!filter(id)) {
      return this.deprecated_transform(code);
    }

    return this.deprecated_transform(this.resolve_comment());
  }
}

export const create_context = (userOptions: Options) => {
  return new Context(userOptions);
};
