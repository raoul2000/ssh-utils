THIS IS A WORK IN PROGRESS

a nodejs module to help work with SSH

# Install

```
npm install ssh-utils
```

# Usage

```js
"use strict";

var execCmd = require('ssh-utils').exec.command;
var catFile = require('ssh-utils').readFileContent;

var cnx = {
    "host": "127.0.0.1",
    "user": "bobMarley",
    "pass": "ja"
};

execCmd(cnx, 'ls -l')
.then(function(result){
  console.log(result);
  return catFile(cnx,'/etc/hosts')
  .then(function(hosts){
    console.log(hosts);
  })
  .fail(function(err){
    console.log("1. error");
    console.log(err);
  });
})
.fail(function(err){
  console.log("2. error");
  console.log(err);
});
```
