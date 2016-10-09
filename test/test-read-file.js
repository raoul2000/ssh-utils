"use strict";

var readFileContent  = require('../src/read-file').readFileContent,
		fs 				= require('fs'),
	  assert  	= require('chai').assert;

var connection  = JSON.parse(fs.readFileSync(__dirname + "/config.json", "utf-8" )).sshConnection;
describe('SSH Load File config',function(done){

	this.timeout(5000);

	it('loads content from file /etc/hosts',function(done){

		return readFileContent(connection,"/etc/hosts")
		.then(function(result){
			assert.deepPropertyVal(result, 'filepath',"/etc/hosts");
			assert.deepPropertyVal(result, 'content.success',true);
			assert.isTrue(result.content.value.length != 0);

			done();
		}).done(null,function(err){
			done(err);
		});
	});

	it('returns error object on file not found',function(done){

		return readFileContent(connection,"NOT_FOUND")
		.then(function(result){
		  assert.deepPropertyVal(result, 'filepath','NOT_FOUND');
			assert.deepPropertyVal(result, 'content.success',false);
			assert.deepPropertyVal(result, 'content.value',null);
			done();
		})
		.fail(function(err){
			done(err);
		})
		.done(null,function(err){
			done(err);
		});
	});
});
