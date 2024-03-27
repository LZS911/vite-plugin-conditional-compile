import { create_context } from '../src/core';
import {
  mock_condition_txt,
  mock_condition_txt_2,
  mock_condition_txt_3,
  mock_condition_txt_4,
  mock_condition_txt_5,
  mock_condition_txt_6,
  mock_condition_txt_7,
  mock_condition_txt_8,
  mock_deprecated_txt,
  mock_js,
  mock_jsx,
  mock_match_txt_1,
  mock_match_txt_2,
  mock_match_txt_3,
  mock_match_txt_4,
  mock_match_txt_5,
  mock_ts,
  mock_tsx,
  mock_txt_1,
} from './code/test_txt';

const remove_space = (str?: string) => str?.replace(/\s/g, '');

describe('test core', () => {
  const ctx = create_context({
    include: /\/src\/.*\.txt*/,
    expand: {
      isDebug: true,
      isCond: true,
      isProd: false,
    },
  });
  beforeAll(() => {
    ctx.set_env({
      dev: true,
      feature: 'cond',
      prod: false,
      prod_version: 'ce',
    });
  });

  it('test deprecated transformAsync', async () => {
    expect(remove_space((await ctx.transformAsync(mock_deprecated_txt, '/src/a.css'))?.code)).toBe(
      remove_space(`
  if true dev  block
  {}
  {if true cond  block}
  {}{}
        `),
    );
  });

  it('test filter', async () => {
    expect(remove_space((await ctx.transformAsync(mock_txt_1, '/src/a.css'))?.code)).toBe(
      remove_space(mock_txt_1),
    );

    expect(remove_space((await ctx.transformAsync(mock_txt_1, '/src/a.txt'))?.code)).toBe(
      remove_space(`
    AAAAAA
    3ufhdsajklnvc832h
    fdsahfjk023dfjs
    fdslkfjfklda
    BBBBBBB`),
    );
  });

  it('test match', () => {
    expect(ctx.pattern_reg.test(mock_match_txt_1)).toBeTruthy();
    expect(ctx.pattern_reg.test(mock_match_txt_2)).toBeFalsy();
    expect(ctx.pattern_reg.test(mock_match_txt_3)).toBeTruthy();
    expect(ctx.pattern_reg.test(mock_match_txt_4)).toBeFalsy();
    expect(ctx.pattern_reg.test(mock_match_txt_5)).toBeTruthy();
  });

  it('test conditional', async () => {
    expect(remove_space((await ctx.transformAsync(mock_condition_txt, '/src/a.txt'))?.code)).toBe(
      remove_space(
        `
      AAAAAA
      else block
      BBBBBBB
      `,
      ),
    );

    expect(remove_space((await ctx.transformAsync(mock_condition_txt_2, '/src/a.txt'))?.code)).toBe(
      remove_space(
        `
      AAAAAA
      if block
      BBBBBBB
      `,
      ),
    );

    expect(remove_space((await ctx.transformAsync(mock_condition_txt_3, '/src/a.txt'))?.code)).toBe(
      remove_space(
        `
      AAAAAA
      elif block
      BBBBBBB
      `,
      ),
    );

    expect(remove_space((await ctx.transformAsync(mock_condition_txt_4, '/src/a.txt'))?.code)).toBe(
      remove_space(
        `
      AAAAAA
      elif block
      BBBBBBB
      `,
      ),
    );

    expect(remove_space((await ctx.transformAsync(mock_condition_txt_5, '/src/a.txt'))?.code)).toBe(
      remove_space(
        `
      AAAAAA
      else block
      BBBBBBB
      `,
      ),
    );

    expect(remove_space((await ctx.transformAsync(mock_condition_txt_6, '/src/a.txt'))?.code)).toBe(
      remove_space(
        `
      AAAAAA
      else block
      BBBBBBB
      `,
      ),
    );

    expect(remove_space((await ctx.transformAsync(mock_condition_txt_7, '/src/a.txt'))?.code)).toBe(
      remove_space(`
      AAAAAA
      else block
      BBBBBBB
    `),
    );

    expect(remove_space((await ctx.transformAsync(mock_condition_txt_8, '/src/a.txt'))?.code)).toBe(
      remove_space(`
      AAAAAA
      <span>elif block</span>
      BBBBBBB
    `),
    );
  });
});

describe('test sourceMaps', () => {
  const ctx = create_context({
    include: /\/src\/.*\.[jt]sx?/,
    expand: {
      isDebug: true,
      isCond: true,
      isProd: false,
    },
  });
  beforeAll(() => {
    ctx.set_env({
      dev: true,
      feature: 'cond',
      prod: false,
      prod_version: 'ce',
    });

    ctx.set_enable_source_maps(true);
  });

  test('dev mode', async () => {
    expect(remove_space((await ctx.transformAsync(mock_js, '/src/a.js'))?.code)).toBe(
      remove_space(`
      import path from 'path';
        `),
    );

    expect(remove_space((await ctx.transformAsync(mock_jsx, '/src/a.jsx'))?.code)).toBe(
      remove_space(`
      import path from 'path';
        `),
    );

    expect(remove_space((await ctx.transformAsync(mock_ts, '/src/a.ts'))?.code)).toBe(
      remove_space(`
      import path from 'path';
        `),
    );

    expect(remove_space((await ctx.transformAsync(mock_tsx, '/src/a.tsx'))?.code)).toBe(
      remove_space(`
      import path from 'path';
        `),
    );

    expect((await ctx.transformAsync(mock_js, '/src/a.js'))?.map).toMatchSnapshot();
  });

  test('prod mod', async () => {
    ctx.set_enable_source_maps(false);

    expect(remove_space((await ctx.transformAsync(mock_tsx, '/src/a.tsx'))?.code)).toBe(
      remove_space(`
      import path from 'path'
        `),
    );
    expect((await ctx.transformAsync(mock_tsx, '/src/a.tsx'))?.map).toBeNull();
  });
});
