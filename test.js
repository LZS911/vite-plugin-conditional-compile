const reg = /\/\*\s*IF(DEBUG|TRUE_\w+)(?:\s*\*\/)?([\s\S]+?)(?:\/\*\s*)?FI\1\s*\*\//g;

'/* IFTRUE_isCE */ \nconsole.log(123)\n /* FITRUE_isCE */'.replace(reg, (match, $1, $2) => {
  console.log(match, 'match');
  console.log($1, '1111');
  console.log($2, '2222');
  return '';
});
