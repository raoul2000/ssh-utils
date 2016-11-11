"use strict";

var sshExec = require('../src/exec'),
		fs 			= require('fs'),
		assert = require('chai').assert;

var connection = {};

describe('SSH Exec commands sequence',function(done){
	this.timeout(5000);

	before(function() {
    connection = JSON.parse(fs.readFileSync(__dirname + "/config.json", "utf-8" )).sshConnection;
  });

	it('runs an array of SSH command',function(done){

		return sshExec.commandSequence(connection,["whoami", "ls"])
		.then(function(result){
			assert.isArray(result);
			assert.isTrue(result.length === 2, "2 values are returned");
			assert.deepEqual(result[0],
				{
					command: 'whoami',
    			success: true,
    			error: null,
    			value: connection.username + '\n'
				}
			);
			var lsValue = result[1].value;
			result[1].value = "";
			assert.deepEqual(result[1],
				{
					command: 'ls',
    			success: true,
    			error: null,
    			value: ""
				}
			);
			done();
		})
		.done(null,function(err){
			done(err);
		});
	});

	it('runs an array of SSH command and returns error',function(done){

		return sshExec.commandSequence(connection,["whoami", "BADCMD"])
		.then(function(result){
			assert.isArray(result);
			assert.isTrue(result.length === 2, "2 values are returned");
			assert.deepEqual(result[0],
				{
					command: 'whoami',
    			success: true,
    			error: null,
    			value: connection.username + '\n'
				}
			);
			assert.isTrue(result[1].command === 'BADCMD');
			assert.isTrue(result[1].success === false);
			assert.isTrue(result[1].value === null);
			done();
		})
		.done(null,function(err){
			done(err);
		});
	});


	it('Apply the same output function to all commands in the sequence',function(done){

		return sshExec.commandSequence(connection,["whoami","date","ls -rtl"],function(output){
			// to upper case and remove trailing \n
			return output.toUpperCase().trim();
		})
		.then(function(results){
			assert.isArray(results);
			assert.lengthOf(results,3);
			assert.propertyVal(results[0], 'value', connection.username.toUpperCase());
			assert.propertyVal(results[1], 'command', 'date');
			assert.propertyVal(results[1], 'success', true);

			assert.propertyVal(results[2], 'command', 'ls -rtl');
			assert.propertyVal(results[2], 'success', true);
			done();
		})
		.done(null,function(err){
			done(err);
		});
	});
});
