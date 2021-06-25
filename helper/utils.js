
module.exports.isValidVarName = (name) => {
  try {
    Function('var ' + name);
  } catch (e) {
    return false;
  }
  return true;
}

module.exports.validatePackageVersion = (val) => {
  return val == 'latest' || (val && val.length > 0 && val.split('.').map(val => isNaN(parseInt(val)) ? 0 : 1).reduce((accumulator, currentValue) => accumulator + currentValue) == 3);
}