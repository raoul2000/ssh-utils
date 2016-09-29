"use strict";

var sshExec = require('../src/exec'),
		fs 			= require('fs'),
		assert = require('chai').assert;

var connection = {};

describe('SSH Exec',function(done){
	this.timeout(5000);

	before(function() {
    connection = JSON.parse(fs.readFileSync(__dirname + "/config.json", "utf-8" )).sshConnection;
  });

	it('runs a SSH command',function(done){

		return sshExec.command(connection,"whoami")
		.then(function(result){
			//console.log(result);
			assert.isTrue(result.success);
			assert.isNull(result.error);
			assert.isTrue( result.command === "whoami");
			assert.propertyVal(result, 'value', connection.user + "\n");
			done();
		})
		.done(null,function(err){
			done(err);
		});
	});

	it('runs a SSH command with a output function',function(done){

		return sshExec.command(connection,"whoami",function(output){
			// to upper case and remove trailing \n
			return output.toUpperCase().trim();
		})
		.then(function(result){
			//console.log(result);
			assert.propertyVal(result, 'value', connection.user.toUpperCase());
			done();
		})
		.done(null,function(err){
			done(err);
		});
	});

	it('fails on bad SSH command',function(done){

		return sshExec.command(connection,"BADCMD")
		.then(function(result){
			//console.log(result);
			assert.isTrue(false);
			//assert.fail(0, 1, 'Exception not thrown');
			done();
		})
		.done(null,function(result){
			//console.log(result);

			assert.isObject(result);
			assert.isFalse(result.success);
			assert.isNotNull(result.error);
			assert.isTrue( result.command === "BADCMD");
			assert.deepPropertyVal(result, 'error.stderr', "bash: BADCMD: command not found\n");
			assert.deepPropertyVal(result, 'error.code', 127);
			done();
		});
	});
});
