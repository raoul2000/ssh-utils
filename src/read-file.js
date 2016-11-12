"use strict";

var Q             = require('q'),
    sshExec       = require("./exec");

/**
 * Reads thee content of a remote file.
 * Invokes **cat filepath** and returns the result of the command
 * execution as provided by the **sshExec.command** function.
 *
 * @param  {object} conn     hash for connection settings
 * @param  {string} filepath path of the file to read
 * @return {object}          Promisyfied result
 */
function readFileContent(conn,  filepath ){

  var validateInputArg = function() {
    if(filepath === null ||filepath.length ===0) {
      throw {
        "success" : false,
        "value" : null,
        "error" : new Error("a filepath value is required")
      };
    } else {
      return true;
    }
  };

  var readRemoteFileContent = function() {
    // the success handler
    var successHandler = function(result) {
      return result;
    };

    // the error handler
    var errorHandler = function(err) {
      throw err;
    };

    return sshExec.command(conn,'cat '+filepath)
    .then(
      successHandler,
      errorHandler
    );
  };

  // main entry point
  return Q.fcall(validateInputArg)
  .then(readRemoteFileContent);

}

exports.readFileContent = readFileContent;
