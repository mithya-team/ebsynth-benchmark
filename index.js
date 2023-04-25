const _ = require("lodash");
const { batchControlnet } = require('./controlnet');
const { ebsynth } = require('./ebsynth');
const { resize } = require('./ffmpeg');
const { convertToVideo } = require('./convert_to_video');
const { pad } = require('./utils');
const fs = require('fs');


const videoDir = "running";
const keyFrameSeparation = 6;
const totalFrames = 230;
const width = 1024;
const height = 576;
const fps = 15;

// const keyFrames = _.times(totalFrames / keyFrameSeparation + 1).map(i => i * keyFrameSeparation);
// keyFrames[keyFrames.length - 1]--;


const main = async () => {
    // await batchControlnet(videoDir, keyFrames);
    // for(let i = 0; i < keyFrames.length; i++) {
    //     await resize(`${videoDir}/key_frames/${pad(keyFrames[i])}.png`, width, height);
    // }
    const keyFrames = (await fs.promises.readdir(videoDir + '/extracted_sprites')).filter(k => k.endsWith('.png')).map(k => parseInt(k));

    console.log("keyFrames", keyFrames);
    await ebsynth(videoDir, keyFrames, totalFrames);
    await convertToVideo(videoDir, keyFrames, totalFrames, fps);
}

main().catch(console.error);

