"use strict";

var Q             = require('q'),
    sshExec       = require("./exec");

function readFileContent(conn,  filepath , whenDone){

  var finalResult = {
    "filepath"  : filepath,
    "content"   : null
  };

  return sshExec.command(conn,'cat '+filepath)
  .then(
    function(result){
      finalResult.content = result;
      if( typeof whenDone === 'function' ) {
        whenDone(finalResult.content);
      }
      return finalResult;
    },
    function(err){
      finalResult.content = err;
      if( typeof whenDone === 'function' ) {
        whenDone(err);
      }
      return finalResult;
    }
  );
}

exports.readFileContent = readFileContent;
