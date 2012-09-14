var pkgcloud = require('../../lib/pkgcloud');

var dropbox = pkgcloud.storage.createClient({
  provider: 'dropbox',
  oauth_token_secret: 'qecb3ej1p5s0503',
  oauth_token: 'trvbg1iq9f1n4qz',
  access_token_key: '7w55spzwsrz3qxm',
  access_token_secret: 's3dxd0kyx34nm9z',
  uid: '9418405'
});

//
// Read a remote file from the drop-box
//
dropbox.writeFile('/public/foo.txt', 'bar', function(err, file){
  console.log(err, file.toString())
});