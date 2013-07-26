#!/usr/bin/env node

if(process.argv.length < 3) process.exit();

require('fs').readFile(process.argv[2], 'utf8', function(err, data) {
  if(err) {
    console.error(err);
    process.exit();
  }

  var start = false;
  var table = {};

  data.split(/\n/).forEach(function(line) {
    if (line.match(/%chardef begin/)) {
      start = true;
      return;
    } else if (line.match(/%chardef end/)) {
      start = false;
      return;
    }

    if(start) {
      var matches = line.match(/([^\s]+)\s+([^\s]+)/);
      var key = matches[1].toLowerCase();

      if(! table[key]) table[key] = [];
      table[key].push(matches[2]);
    }
  });

  var sortedTable = {};

  Object.keys(table).sort().forEach(function(key) {
      sortedTable[key] = table[key];
  });

  console.log(JSON.stringify(sortedTable));
});
