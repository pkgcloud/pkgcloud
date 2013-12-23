var pkgcloud = require('../../lib/pkgcloud');
var os = require('os');
var fs = require('fs');

var rackspace = pkgcloud.storage.createClient({
  provider: 'rackspace',
  username: 'rackspace_id',
  apiKey: '1234567890poiiuytrrewq',
  region: 'IAD'//storage requires region or else assumes default
});

// Basic container and file operations. Please note that due to the asynchrous nature of JS programming,
// the code sample below will cause unexpected results if run as-a-whole and are meant for documentation 
// and illustration purposes.


//1 -- to create a container
rackspace.createContainer({name: 'sample-container-test', metadata: {callme: "maybe"}}, function (err, container) {
	if(!err) { 
		console.log(container.name + os.EOL)
		console.log(container.metadata)
	}
});

//2 -- to list our containers
rackspace.getContainers(function (err, containers) {
	if(!err) {
		for (var _i = 0; _i < containers.length; _i++) {
			console.log(containers[_i].name + os.EOL)
		}
	}
});

// 3 -- to create a container and upload a file to it
rackspace.createContainer({name: 'sample-container', metadata: {callme: "maybe"}}, function (err, container) {
	if(!err) { 
		var my_file = fs.createReadStream('/Users/pix/IMG_0076.JPG');
		my_file.pipe(rackspace.upload({container: container.name, remote: 'profile-picture.jpg'},
			function (err, result) {
				if(!err) { 
					console.log(result);
				}
			}));
	}
});

//4 -- to get a container, empty it, then finally destroying it
rackspace.getContainer('sample-container', function (err, container) {
	if(!err) {
		rackspace.getFiles(container, function (err, files) {
			for(var _i = 0; _i < files.length; _i++) {
				rackspace.removeFile(container, files[_i], function (err, result) {
					if(!err) {
						console.log('File deleted: ' + result);
					}
				});
			}
			rackspace.destroyContainer(container, function (err, result) {
				if(!err) {
					console.log('Container ' + container.name + ' was successfully destroyed.')
				}
			});
		});
	}
});