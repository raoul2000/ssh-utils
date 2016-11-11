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
			assert.deepPropertyVal(result, 'success',true);
			assert.isTrue(result.value.length != 0);

			done();
		}).done(null,function(err){
			done(err);
		});
	});

	it('returns error object on file not found',function(done){

		return readFileContent(connection,"NOT_FOUND")
		.then(function(result){
			assert.deepPropertyVal(result, 'success',false);
			assert.deepPropertyVal(result, 'value',null);
			done();
		})
		.fail(function(err){
			done(err);
		})
		.done(null,function(err){
			done(err);
		});
	});

	it('returns error when no filepath is provided',function(done){

		return readFileContent(connection,"")
		.then(function(result){
			assert.deepPropertyVal(result, 'success',false);
			assert.deepPropertyVal(result, 'value',null);
			done(new Error("promise should have been rejected"));
		})
		.fail(function(err){
			done();
		})
		.done(null,function(err){
			done(err);
		});
	});
});
