const _ = require('lodash');
const {  run } = require('./utils');


const resize = async (inputImage, width, height) => { 

    const tmpImage = _.random(10000, 99999) + '.png';
    await run(`ffmpeg -i ${inputImage} -vf scale=${width}:${height} ${tmpImage}`);
    await run(`mv ${tmpImage} ${inputImage}`)
}

module.exports = {
    resize
}