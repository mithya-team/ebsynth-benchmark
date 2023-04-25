
const path = require('path');
const Bottleneck = require('bottleneck');
const { pad, run } = require('./utils');
const cliProgress = require('cli-progress');

const ebsynth = async (videoDir, keyFrames, totalFrames) => {
    console.log("Running Ebsynth");
    await run(`rm -rf ${videoDir}/ebsynth`);
    await run(`mkdir -p ${videoDir}/ebsynth`);
    const commands = getEbsynthCommands(videoDir, keyFrames, totalFrames);

    const limiter = new Bottleneck({
        maxConcurrent: 3,
    });

    const bar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);


    const limitedRun = limiter.wrap(run);

    await Promise.all(commands.mkdirCommands.map(run));

    bar.start(commands.ebsynthCommands.length, 0);

    await Promise.all(commands.ebsynthCommands.map(async(command) => {
      await limitedRun(command);
      bar.increment();
    }));

    bar.stop();
}

const getEbsynthCommands = (videoDir, keyFrames, totalFrames) => {
    const ebsynthCommands = [];
    const mkdirCommands = [];
  
    for (let i = 0; i < keyFrames.length; i++) {
      const keyFrameNumber = keyFrames[i];
      const prevKeyFrameNumber = keyFrames[i - 1] || keyFrames[i - 1] === 0 ? keyFrames[i - 1] : -1;
      const nextKeyFrameNumber = keyFrames[i + 1] ? keyFrames[i + 1] : totalFrames;
  
      const outputFolder = path.join(videoDir, 'ebsynth', `output_${pad(keyFrameNumber)}`);
      mkdirCommands.push(`mkdir -p ${outputFolder}`);
      for (let rawFrameNumber = prevKeyFrameNumber + 1; rawFrameNumber < nextKeyFrameNumber; rawFrameNumber++) {

        const command = getEbsynthCommand({
          style: path.join(videoDir, 'extracted_sprites', `${pad(keyFrameNumber)}.png`),
          source:  path.join(videoDir, 'extract', `${pad(keyFrameNumber)}.png`),
          target: path.join(videoDir, 'extract', `${pad(rawFrameNumber)}.png`),
          output:  path.join(outputFolder, `${pad(rawFrameNumber)}.png`)
        });
        ebsynthCommands.push(command)
      }
    }
  
    return { ebsynthCommands, mkdirCommands }
}


const getEbsynthCommand = ({ style, source, target, output }) => {
    return `bin/ebsynth -style ${style} -guide ${source} ${target} -output ${output}`;
}


module.exports = {
    ebsynth,
}