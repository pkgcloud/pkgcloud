/*
 * flavors.js: Implementation of Azure Flavors Client.
 *
 * (C) Microsoft Open Technologies, Inc.
 *
 */

// spawns the following vows command line in a cross platform manner
// NOCK=on vows test/*/*/*-test.js --spec --isolate"

// Note:
// "echo y  | ssh-keygen -f test/fixtures/testkey -q -t rsa -N '' 2>&1 > /dev/null &&
// is no longer needed in the test command line.
// testkey are checked into tests/fixtures/testkey and testkey.pub

var path = require('path'),
  spawn = require('child_process').spawn,
  args = ['-i', '--spec','--color', './test/*/*/*-test.js'],
  options = {cwd : process.cwd()},
  vowsPath = (process.platform === 'win32') ? path.resolve('./node_modules/.bin/vows.cmd') : 'vows',
  util = require('util'),
  vows;

// turn on NOCK
process.env.NOCK = 'on';

// run vows testing
vows = spawn(vowsPath, args, options);

// test results
vows.stdout.on('data', function (data) {
  util.print(data);
});

// test errors
vows.stderr.on('data', function (data) {
  util.error(data);
});

vows.on('exit', function (code) {
  console.log('vows exited with code ' + code);
});