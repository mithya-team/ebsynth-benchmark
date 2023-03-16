const exec = require('child_process').exec;
const fs = require('fs/promises');
const Bottleneck = require('bottleneck');
const cliProgress = require('cli-progress');
const { pad, run} = require('./utils');

const composite_image_command = (image_1, image_2, strength, output) => {
    const command = `ffmpeg -i ${image_1} -i ${image_2} -filter_complex "[1]format=yuva444p,colorchannelmixer=aa=${strength}[in2];[0][in2]overlay" ${output} -y`;
    return command;
}

const get_key_frames = (frame, keyFrames) => {
    let low_frame = -Infinity, high_frame = Infinity;
    for (let i = 0; i < keyFrames.length; i++) {
        if (keyFrames[i] <= frame && keyFrames[i] > low_frame) {
            low_frame = keyFrames[i];
        }
    }
    for (let i = 0; i < keyFrames.length; i++) {
        if (keyFrames[i] > frame && keyFrames[i] < high_frame) {
            high_frame = keyFrames[i];
        }
    }

    if(low_frame === -Infinity) {
        low_frame = null;
    }
    if(high_frame === Infinity) {
        high_frame = null;
    }
    return [low_frame, high_frame];
}

const convertToVideo = async (videoDir, keyFrames, totalFrames, fps) => {
    console.log("Running convertToVideo");

    const ebsynth_processed_frames_folder = `${videoDir}/ebsynth`;
    const composite_image_sequence_folder = `${videoDir}/composite_image_sequence`;

    const start_time = Date.now();

    await fs.mkdir(composite_image_sequence_folder, { recursive: true });

    const composite_image_commands = [];
    for (let i = 0; i < totalFrames; i++) {
        const frame = pad(i);
        const input_key_frames = get_key_frames(i, keyFrames);


        const image_1 = `${ebsynth_processed_frames_folder}/output_${pad(input_key_frames[0])}/${frame}.png`;
        const output = `${composite_image_sequence_folder}/${frame}.png`;
        if(!keyFrames[0] || !keyFrames[1]) {
            await fs.copyFile(image_1, output);
            continue;
        }

        const image_2 = `${ebsynth_processed_frames_folder}/output_${pad(input_key_frames[1])}/${frame}.png`;
        const strength = Math.round((i - input_key_frames[0]) * 1000 / (input_key_frames[1] - input_key_frames[0])) / 1000;

        composite_image_commands.push(composite_image_command(image_1, image_2, strength, output));
    }

    const limiter = new Bottleneck({ maxConcurrent: 10 });

    const bar = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);

    bar.start(composite_image_commands.length, 0);

    await Promise.all(composite_image_commands.map(async command => {
        await limiter.schedule(() => run(command));
        bar.increment();
    }));

    await run(`ffmpeg -framerate ${fps} -i ${composite_image_sequence_folder}/%05d.png -r ${fps} -vcodec libx264 -crf 25 -pix_fmt yuv420p -y ${videoDir}/converted_video.mp4`)
    bar.stop();
    console.log(`Total time: ${((Date.now() - start_time) / 1000).toFixed(2)} seconds`);
}


module.exports = {
    convertToVideo
}