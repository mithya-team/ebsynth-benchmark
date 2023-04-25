const { exec } = require('child_process');

const run = async (command) => {
    // console.log(command)
    return await new Promise((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
            if (error) {
                reject(error);
            }
            resolve(stdout);
        })
    });
}

const wait = (ms = 1000) => new Promise(resolve => setTimeout(resolve, ms));

const pad = (num, size = 5) => String(num).padStart(size, '0');

module.exports = {
    run,
    wait,
    pad
}