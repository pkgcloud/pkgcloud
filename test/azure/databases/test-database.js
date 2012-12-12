//TODO: Make this a vows test

var helpers = require('../../helpers');

var options = {
  name: 'test10'
}

var client = helpers.createClient('azure', 'database');

//
// Create an Azure Table
//
client.create(options, function (err, result) {
  //
  // Check the result
  //
  console.log(err, result);

  //
  // Now delete that same Azure Table
  //
  if (err === null) {
    client.remove(result.id, function (err, result) {
      //
      // Check the result
      //
      console.log(err, result);
    });
  }
});
