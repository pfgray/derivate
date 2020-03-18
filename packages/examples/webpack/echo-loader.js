const { getOptions, getCurrentRequest } = require('loader-utils')
const highlight = require('cli-highlight').highlight


module.exports = function(source, map, meta) {
  
  const options = getOptions(this);

  // Apply some transformations to the source...
  console.log('###', options.label, '(' + this.resourcePath + ')', '####');
  console.log(highlight(source, {
    language: 'ts'
  }));
  console.log('')

  return source;
}