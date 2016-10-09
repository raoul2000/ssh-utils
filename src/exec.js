"use strict";

var SSHClient = require('ssh2').Client,
		Q         = require('q');
/**
 * Run a single SSH command and returns the result.
 * When fullfilled the promise result is an object with the following properties :
 *
 * - command : (string) SSH command that was executed
 * - success : (boolean) command execution status
 * - error   : (null|object) when "success" is True this property is NULL, otherwise
 * it contains an object describing the error
 * - value   : (string|null) when "success" is True contains the value returned by
 * the command, otherwise NULL
 *
 * @param  {object} cnxParams SSH connection settings
 * @param  {string} cmd       the command to execute
 * @param  {function} fnOutput  optional function to process command output
 * @return {Promise}           Promisyfied result
 */
function sshExecSingleCommand(cnxParams, cmd, fnOutput){

  var ssh2connection = {
    host    : cnxParams.host,
    port    : cnxParams.port,
    username: cnxParams.user,
    password: cnxParams.pass
  };
  var result = {
    "command" : cmd,
    "success" : true,
    "error"   : null,
    "value"   : null
  };
  var sshClient = new SSHClient();
  return Q.promise(function(resolve, reject) {
    sshClient.on('ready', function() {
      var stdout = "";
      var stderr = "";

      sshClient.exec(cmd, function(err, stream) {
        if (err) {throw err;}

        stream.on('close', function(code, signal) {
          sshClient.end();
          if( code !== 0 ){
            result.success = false;
            result.error = {"stderr" : stderr, "code" : code};
            reject(result);

          } else if (fnOutput && typeof fnOutput === 'function') {
              result.value = fnOutput(stdout);
              resolve(result);
          } else {
              result.value = stdout;
              resolve(result);
          }
        }).on('data', function(data) {
          stdout += data;
        }).stderr.on('data', function(data) {
          stderr += data;
        });
      });
    })
    .on('error',function(error){
      result.success = false;
      result.error = error;
      reject(result);
    })
    .connect(ssh2connection);
  });
}
exports.command = sshExecSingleCommand;


/**
 * Execute a list of commands in parallel and returns a Promise for all results.
 *
 * @param  {object} connection SSH connection parameters
 * @param  {array} commands   array of SSH commands to execute
 * @param  {function} fnOutput   optional function applied to commands output
 * @return {Promise}            Fullfilled as an array of results
 */
function sshCommandParallel(connection, commands, fnOutput) {
  var commandList = commands.map(function(command){
    return sshExecSingleCommand(connection, command, fnOutput);
  });
  return Q.allSettled(commandList)
  .then(function(results){
    return results.map(function(result){
      if( result.state === "rejected") {
        return result.reason;
      } else {
        return result.value;
      }
    });
  });
}
exports.commandParallel = sshCommandParallel;

/**
 * Sequentially execute a list of Promised based SSH command and
 * returns a Promise whose value is resvoled as an array. This array
 * contains objects that holds the SSH command success or error.
 *
 * @param  {[type]} connection [description]
 * @param  {[type]} commands   [description]
 * @return {[type]}            [description]
 */
function sshCommandSequence(connection, commands, fnOutput) {

  var allResults = [];
  var successHandler = function(nextPromise){
    return function(result) {
      if( result !== true) {  // the first result must be ignored
        allResults.push(result);
      }
      return nextPromise();
    };
  };

  var errorHandler = function(nextPromise) {
    return function(error) {
      allResults.push(error);
      return nextPromise();
    };
  };

  // start the sequential fullfilment of the Promise chain
  // The first result (true) will not be inserted in the result array, it is here
  // just to start the chain.
  var result = Q(true);
  commands.map(function(command){
    return function() { return sshExecSingleCommand(connection, command, fnOutput); };
  }).forEach(function (f) {
    result = result.then(
      successHandler(f),
      errorHandler(f)
    );
  });

  // As the last result is not handled in the forEach loop, we must handle it now
  return result.then(
      function(finalResult){
      allResults.push(finalResult);
      return allResults;
    },
    function(error) {
      allResults.push(error);
      return allResults;
  });
}
exports.commandSequence = sshCommandSequence;
