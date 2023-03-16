const axios = require('axios');
const fs = require('fs');
const cliProgress = require('cli-progress');
const { run } = require('./utils');

const apiKey = "f24ccd804e5675f4cf55cb8afe889726bf12d879";
const version = "ebbcf5062eca3252762a69bb2d46e4fd128d91e3ceed409af58bb06016bbcda4";

const defaults = {
    num_samples: "1",
    image_resolution: "512",
    low_threshold: 100,
    high_threshold: 200,
    ddim_steps: 20,
    scale: 9,
    seed: 5555,
    eta: 0,
    a_prompt: "best quality, extremely detailed",
    n_prompt: "longbody, lowres, bad anatomy, bad hands, missing fingers, extra digit, fewer digits, cropped, worst quality, low quality",
}


const controlnet = async (options) => {

    const base64String = `data:image/png;base64,${options.image.toString('base64')}`;

    const formData = {
        input: {
            ...defaults,
            ...options,
            image: base64String
        },
        version
      };
    
    const { data } = await axios(
        {
            method: 'post',
            url: "https://api.replicate.com/v1/predictions",
            data: formData,
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Token ${apiKey}`,
            },
        }
    );

    let prediction;
    do {
        wait(2000);
        prediction = await getPrediction(data.urls.get);
    } while (prediction.status !== 'failed' && prediction.status !== 'succeeded');

    const outputImageUrl = prediction.output[1];

    let { data: outputImageStream } = await axios({
        url: outputImageUrl,
        responseType: "stream"
    });

    return outputImageStream;
}


const getPrediction = async (predictionUrl) => {
    const { data } = await axios(
        {
            url: predictionUrl,
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Token ${apiKey}`,
            },
        }
    );

    return data;
}


const batchControlnet = async (videoDir, keyFrames) => {
    console.log("Running batch controlnet");

    const bar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);
    await run(`mkdir -p ${videoDir}/key_frames`);
    await run(`rm -rf ${videoDir}/key_frames/*`);

    bar.start(keyFrames.length, 0);
    await Promise.all(keyFrames.map(async (keyFrame) => {
        const frame = String(keyFrame).padStart(5, '0');
        const image = await fs.promises.readFile(`${videoDir}/extract/${frame}.png`);
        const outputImageStream = await controlnet({
            image,
            prompt: "white horses"
        });

        outputImageStream.pipe(fs.createWriteStream(`${videoDir}/key_frames/${frame}.png`));
        await new Promise(resolve => outputImageStream.on("end", resolve));
        bar.increment();
    }));
    bar.stop();
}

const wait = (timeout = 1000) => new Promise(resolve => setTimeout(resolve, timeout));

module.exports = {
    batchControlnet
}