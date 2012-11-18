/*
 * test.js: cross platform vows test driver.
 *
 * (C) Microsoft Open Technologies, Inc.
 *
 */

// spawns the following vows command line in a cross platform manner
// NOCK=on vows test/*/*/*-test.js --spec --isolate"

// Note:
// "echo y  | ssh-keygen -f test/fixtures/testkey -q -t rsa -N '' 2>&1 > /dev/null &&
// is no longer needed in the test command line.
// testkeys for testing are now located in tests/fixtures/testkey and testkey.pub

var path = require('path'),
  exec = require('child_process').exec,
  fs = require('fs'),
  errs = require('errs'),
  util = require('util'),
  vowsCmd,
  options,
  env = process.env || {},
  vows;

// turn on NOCK
env.NOCK = 'on';

options = {
  cwd : process.cwd(),
  env: env
};

// Since our tests use require('vows') we must use the version of vows installed in the node_modules.
// The globally installed version may be the wrong version and therefore different from the version
// we required in our tests.
vowsCmd = (process.platform === 'win32') ? path.resolve('./node_modules/.bin/vows.cmd')
  : path.resolve('./node_modules/.bin/vows');

// check if vows exists and is properly installed in ./node_modules
if(!fs.existsSync(vowsCmd)) {
  throw(errs.create("vows is not installed in ./node_modules. Please run npm install -d to install testing modules."));
};

// add vows args. Needed to add --color to get typical vows output text colors
vowsCmd += ' -i --spec --color ./test/*/*/*-test.js';

// run vows
vows = exec(vowsCmd, options);

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