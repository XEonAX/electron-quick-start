'use strict';

const execFile = require('child_process').execFile;

module.exports = (...args) => {
    return new Promise((resolve, reject) => {
        execFile(...args, (err, stdout) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(stdout);
        });
    });
};