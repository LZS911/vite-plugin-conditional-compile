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

export const mock_match_txt_1 = `
AAAAAA
// # if [dev]
if block
// #else
else block
else block
// #endif
BBBBBBB
`;

export const mock_match_txt_2 = `
AAAAAA
// # if dev
if block
// #else
else block
// #endif
BBBBBBB
`;

export const mock_match_txt_3 = `
AAAAAA
/* # if [dev] */
if block
// #else
else block
else block
// #endif
BBBBBBB
`;

export const mock_match_txt_4 = `
AAAAAA
/* # if [dev=123;] */
if block
// #else
else block
else block
// #endif
BBBBBBB
`;

export const mock_match_txt_5 = `
AAAAAA
// # if [dev]
if block
{/* #elif [prod]*/}
else block
{ /* # elif [prod] */ }
else block
{/*#endif*/}
// #endif
BBBBBBB
`;

export const mock_match_txt_6 = `
AAAAAA
<!-- #if [!dev] -->
<span>if block</span>
 <!-- #elif [!prod] -->
<span>elif block</span>
<!-- #else*/ -->
<span>else block</span>
 <!-- #endif  -->
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

export const mock_condition_txt_7 = `
AAAAAA
//#if [feature!=cond]
ifdef block
//#else
else block
{/* #endif */}
BBBBBBB
`;

export const mock_condition_txt_8 = `
AAAAAA
<!-- #if [!dev] -->
<span>if block</span>
 <!-- #elif [!prod] -->
<span>elif block</span>
<!-- #else*/ -->
<span>else block</span>
 <!-- #endif  -->
BBBBBBB
`;

export const mock_js = `

// #if [dev]
import path from 'path'

// #elif [prod]
import fs from 'fs'
// #endif

`;

export const mock_jsx = `

// #if [dev]
import path from 'path'

// #elif [prod]
import fs from 'fs'
// #endif

`;

export const mock_tsx = `

// #if [dev]
import path from 'path'

// #elif [prod]
import fs from 'fs'
// #endif

`;

export const mock_ts = `

// #if [dev]
import path from 'path'

// #elif [prod]
import fs from 'fs'
// #endif

`;
