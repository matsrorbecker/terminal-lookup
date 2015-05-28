#!/usr/bin/env node

var request = require('request');

var argv = require('minimist')(process.argv.slice(2));

if (argv.h || argv.help || process.argv.length == 2) {
  console.log('Usage: tlookup searchTerm [-l languageCode]');
  console.log('Example: tlookup javascript -l sv');
  process.exit(0);  
}

var searchTerm = argv._.join(' ');

var languageCode;
if (argv.l)
  languageCode = argv.l;
else if (argv.language)
  languageCode = argv.language;
else
  languageCode = 'en';
  
var url = 'http://' + languageCode + '.wikipedia.org/w/api.php';

var queryObject = {
  action: 'opensearch',
  search: searchTerm,
  redirects: 'resolve',
  format: 'json'  
};

var options = {
  url: url,
  qs: queryObject,
  headers: {
    'User-Agent': 'terminal-lookup v0.0.1 (https://github.com/matsrorbecker/terminal-lookup, mats@rorbecker.com)'
  }
};

var printError = function(message) {
  console.error(message);
  process.exit(1);  
};

var printResults = function(results) {
  console.log('\nResults for \'' + searchTerm + '\':\n');
  for (var i = 0; i < results.length; i++) {
    if (results[i].toLowerCase().indexOf(searchTerm.toLowerCase()) != -1)
      console.log(results[i] + '\n');    
  }
};

request(options, function(error, response, body) {
  if (error) printError('' + error);
  
  if (response.statusCode == 200) {
    try {
      var resultArray = JSON.parse(body);
      printResults(resultArray[2]);
    }
    catch (parseError) {
      printError('' + parseError);
    }
  }
  else if (response.statusCode == 404) {
    var message = 'Sorry, could not retrieve results ... :(\n';
    message += 'Did you provide a valid, two-letter language code?';
    printError(message);
  }
  else {
    printError('Sorry, something went wrong ... :(');
  }
});
