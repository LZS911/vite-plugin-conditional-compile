export const mock_deprecated_txt = `
/* IFTRUE_isDebug */
if true dev  block
/* FITRUE_isDebug */

{/* IFTRUE_isCond */}
{if true cond  block}
{/* FITRUE_isCond */}

{/* IFTRUE_isProd */}
if true prod  block
{/* FITRUE_isProd */}

`;

export const mock_txt_1 = `
  AAAAAA
  // # if [dev]
  3ufhdsajklnvc832h
  fdsahfjk023dfjs
  fdslkfjfklda
  // #else
  else block
  else block
  else block
  else block
  // #endif
  BBBBBBB
`;

export const mock_condition_txt = `
  AAAAAA
  //#if [dev && feature=12]
  if block
  // #elif [prod]
  elif block
  {/*#else*/}
  else block
  {/* #endif */}
  BBBBBBB
`;

export const mock_condition_txt_2 = `
  AAAAAA
  //#if [dev || feature=cc]
  if block
  // #elif [prod]
  elif block
  {/*#else*/}
  else block
  {/* #endif */}
  BBBBBBB
`;

export const mock_condition_txt_3 = `
  AAAAAA
  //#if [dev && (feature=cc || prod)]
  if block
  // #elif [!prod]
  elif block
  {/*#else*/}
  else block
  {/* #endif */}
  BBBBBBB
`;

export const mock_condition_txt_4 = `
  AAAAAA
  //#if [dev && (feature=cond || prod) && !prod && !dev]
  if block
  // #elif [!prod]
  elif block
  {/*#else*/}
  else block
  {/* #endif */}
  BBBBBBB
`;

export const mock_condition_txt_5 = `
  AAAAAA
  //#if [dev && !(feature=cond)]
  if block
  // #elif [prod]
  elif block
  {/*#else*/}
  else block
  {/* #endif */}
  BBBBBBB
`;

export const mock_condition_txt_6 = `
  AAAAAA
  //#if [!!API]
  ifdef block
  //#else
  else block
  {/* #endif */}
  BBBBBBB
`;
