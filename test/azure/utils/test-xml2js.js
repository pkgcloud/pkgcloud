var fs = require('fs');
var xml2js = require('xml2js');

var xml = fs.readFileSync('../../fixtures/azure/list-containers.xml','utf-8');

var index = xml.indexOf('<');
if(index > 0) {
  xml = xml.slice(index);
}

var parser = new xml2js.Parser();

parser.parseString(xml, function (err, result) {
  if(err) {
    console.dir(err);
  } else {
    console.dir(result);
  }
});