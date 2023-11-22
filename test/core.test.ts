import { create_context } from '../src/core';
import { mock_condition_txt_6, mock_deprecated_txt } from './code/test_txt';

const remove_space = (str: string) => str.replace(/\s/g, '');

describe('test', () => {
  const ctx = create_context({
    include: /\/src\/.*\.tsx*/,
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
    });
  });

  it('test deprecated transform', () => {
    expect(remove_space(ctx.transform(mock_deprecated_txt, '/src/a.js'))).toBe(
      remove_space(`
  if true dev  block
  {}
  {if true cond  block}
  {}{}
        `),
    );
  });

  // it('test filter', () => {
  //   expect(remove_space(ctx.transform(mock_txt_1, '/src/a.js'))).toBe(remove_space(mock_txt_1));

  //   expect(remove_space(ctx.transform(mock_txt_1, '/src/a.ts'))).toBe(
  //     remove_space(`
  //   AAAAAA
  //   3ufhdsajklnvc832h
  //   fdsahfjk023dfjs
  //   fdslkfjfklda
  //   BBBBBBB`),
  //   );
  // });

  it('test conditional', () => {
    // expect(remove_space(ctx.transform(mock_condition_txt, '/src/a.ts'))).toBe(
    //   remove_space(
    //     `
    //   AAAAAA
    //   else block
    //   BBBBBBB
    //   `,
    //   ),
    // );

    // expect(remove_space(ctx.transform(mock_condition_txt_2, '/src/a.ts'))).toBe(
    //   remove_space(
    //     `
    //   AAAAAA
    //   if block
    //   BBBBBBB
    //   `,
    //   ),
    // );

    // expect(remove_space(ctx.transform(mock_condition_txt_3, '/src/a.ts'))).toBe(
    //   remove_space(
    //     `
    //   AAAAAA
    //   elif block
    //   BBBBBBB
    //   `,
    //   ),
    // );

    // expect(remove_space(ctx.transform(mock_condition_txt_4, '/src/a.ts'))).toBe(
    //   remove_space(
    //     `
    //   AAAAAA
    //   elif block
    //   BBBBBBB
    //   `,
    //   ),
    // );

    // expect(remove_space(ctx.transform(mock_condition_txt_5, '/src/a.ts'))).toBe(
    //   remove_space(
    //     `
    //   AAAAAA
    //   else block
    //   BBBBBBB
    //   `,
    //   ),
    // );

    expect(remove_space(ctx.transform(mock_condition_txt_6, '/src/a.ts'))).toBe(
      remove_space(
        `
      AAAAAA
      else block
      BBBBBBB
      `,
      ),
    );
  });
});
