// var pkgcloud = require('../../../lib/pkgcloud'),
//     should = require('should'),
//     fs = require("fs"),
//     Buffer = require("buffer").Buffer,
//     mock = !!process.env.MOCK;
// 
// describe('pkgcloud/rackspace/storage/stroage-archive', function() {
//   
//   //foo.tar.gz, bytes in base64; containing a folder named 'foo' which has a single text file
//   var data = "H4sIABub81EAA+3TzUrEMBAH8CiIeNKTXvMC1nxuVzx58CiC9uBNam1kQZt1N4X1XXwDX9IJXVi6UDxo6sH/D4akadJOmY7z/owlJkhubTdOulEo040dJpXMTS6tjuuSriTjNnViUbsM5YJztvCPs+atHdxH25wbI6FxOap/9hDqZcjCKqR5RyzwxJjB+iurN/WXiuqvpdGMizTp9P3z+rO94322y9h1WfGbO37P1+IaO6BQFO8U8fqzd/Jo6JGXRXG7nsYTHxSHW1t2NusnlX/Nyvn8pc6KehWumso/zZpnutkGdzq9kNrQv3E+Nb/yudAX+z9t93/f/0LIrf5XNEP/j0H+dQIAAAAAAAAAAAAAAAAAAADwY194ELb5ACgAAA==";
//   
//   var client = pkgcloud.storage.createClient({
//     provider: "rackspace",
//     apiKey: "",
//     username: ""
//   });
//   
//       
//   var tmp = "./foo.tar.gz";
//   fs.writeFileSync(tmp, new Buffer(data, "base64"));
//   
//   this.timeout(10000);
//   
//   it('should upload an archive and extract', function(done) {
//     
//     //give no other options, then extract contenst in the root, creating containers for every folder in the archive
//     client.extract({
//       local: tmp
//     },function(e, ok, resp) {
//       console.log(resp);
//       should.not.exist(e);
//       client.download({
//         container: "foo",
//         remote: "test.txt",
//         local: "foo.download"
//       }, function(e) {
//         should.not.exist(e);
//         
//         var content = fs.readFileSync("foo.download", "utf8");
//         content.should.equal("1");//the file contains only a single character '1'
//         fs.unlinkSync("foo.download");
//         done();
//       });
//     }); 
//   });
//   
//   it('should upload and extract with pesodu-directories', function(done) {
//     
//     //a test container should be prepared in adavance
//     client.extract({
//       container: "test-dir",
//       local: tmp
//     }, done);
//     
//   });
//   
//   after(function() {
//     fs.unlinkSync(tmp);
//   });
//   
// });