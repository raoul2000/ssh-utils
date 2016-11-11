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
			assert.isTrue(result.success);
			assert.isNull(result.error);
			assert.isTrue( result.command === "whoami");
			assert.propertyVal(result, 'value', connection.username + "\n");
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
			assert.propertyVal(result, 'value', connection.username.toUpperCase());
			done();
		})
		.done(null,function(err){
			done(err);
		});
	});

	it('fails on bad SSH command',function(done){

		return sshExec.command(connection,"BADCMD")
		.then(function(result){
			assert.isTrue(false);
			done();
		})
		.done(null,function(result){
			//console.log(result);

			assert.isObject(result);
			assert.isFalse(result.success);
			assert.isNotNull(result.error);
			assert.isTrue( result.command === "BADCMD");
			assert.deepPropertyVal(result, 'error.code', 127);
			done();
		});
	});


	it('throws exception if connection settings are missing',function(done){

		try {
			return sshExec.command(null,"ls")
			.then(function(result){
				done(new Error("promise rejection is expected"));
			})
			.fail(function(err){
				done();
			});
		} catch (e) {
			done();
		}
	});
/*
	it('throws exception if connection settings are incorrect',function(done){
		var wrongConnection = {
	    "host": connection.host,
	    "username": "INVALID",
	    "password" : connection.password,
			"readyTimeout" : 1000
	  };
		try {
			return sshExec.command(wrongConnection,"ls")
			.then(function(result){
				done(new Error("promise rejection is expected"));
			});
			done(new Error);
		} catch (e) {
			done();
		}
	});
	*/
});
