
const path = require('path');
const fs = require('fs');

module.exports = {
    createDirIfNotExists: function (dir) {
        if (!fs.existsSync(dir)){
            fs.mkdirSync(dir);
        }
        return dir;
    },
    absPath: function (p) {
        return path.resolve(p);
    }
};