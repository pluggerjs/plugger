const fs         = require('fs');
const path       = require('path');
const jsonfile   = require('jsonfile');

var myObject     = {};
var tmpDir       = require('os').homedir() + '/.plugger';

class Preferences {
  constructor (name) {
    this._file = path.join(tmpDir, name);
    this._myObject = {};

    this.loadObject();
  }

  loadObject () {
    if (!fs.existsSync(tmpDir)) {
      fs.mkdirSync(tmpDir);
      jsonfile.writeFileSync(this._file, this._myObject);
    } else {
      if (!fs.existsSync(this._file)) {
        jsonfile.writeFileSync(this._file, this._myObject);
      } else {
        this._myObject = jsonfile.readFileSync(this._file);
      }
    }
  }

  push (key, value) {
    this._myObject[key] = value;
  }

  get (key) {
    return this._myObject[key];
  }

  save (cb) {
    jsonfile.writeFile(this._file, this._myObject, {spaces: 2}, cb);
  }
}

module.exports = function (name) {
  return new Preferences(name);    
};