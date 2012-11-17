var spawn = require('child_process').spawn,
  util = require('util'),
  vows;

process.env.NOCK = 'on';

// spawns the following vows command line in a cross platform manner
// NOCK=on vows test/*/*/*-test.js --spec --isolate"


// "echo y  | ssh-keygen -f test/fixtures/testkey -q -t rsa -N '' 2>&1 > /dev/null && is no longer
// needed in the test command line. testkey are checked into tests/fixtures/testkey and testkey.pub


var args = ['./node_modules/.bin/vows', '-i', '--spec','--color','./test/*/*/*-test.js'];

vows = spawn(process.execPath, args);

vows.stdout.on('data', function (data) {
  util.print(data);
});

vows.stderr.on('data', function (data) {
  util.error(data);
});

vows.on('exit', function (code) {
  console.log('vows exited with code ' + code);
});