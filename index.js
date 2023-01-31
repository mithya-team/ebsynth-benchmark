const { exec } = require('child_process');
const path = require('path');
const fs = require('fs/promises');
const Bottleneck = require('bottleneck');
const cliProgress = require('cli-progress');
const { chunk } = require('lodash');

const EBSYNTH_BINARY = 'ebsynth_Linux_Cuda';
const maxConcurrent = 5;
const tasksInOneCommand = 1;

const ebsynth_path = path.join(__dirname, 'bin', EBSYNTH_BINARY);
const style = path.join(__dirname, 'SampleProject', 'key', 'frame-0.jpg');
const source_frame = path.join(__dirname, 'SampleProject', 'data', 'frame-0.jpg');
const input_frames_dir = path.join(__dirname, 'SampleProject', 'data');
const output_frames_dir = path.join(__dirname, 'SampleProject', 'output');

const run = async (command) => new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
        if (error) {
            return reject(error);
        }
        if (stderr) {
            console.error(stderr);
        }
        return resolve(stdout);
    });
});

const run_ebsynth = async () => {
    const images = await fs.readdir(input_frames_dir);

    const limiter = new Bottleneck({
        maxConcurrent,
    });

    const limited_run = limiter.wrap(run);
    await fs.rm(output_frames_dir, { force: true, recursive: true });

    await fs.mkdir(output_frames_dir, { recursive: true });

    const bar = new cliProgress.SingleBar(
        {
            format: 'progress [{bar}] {percentage}% | ETA: {eta}s | {value}/{total} | {duration_formatted}',
        },
        cliProgress.Presets.shades_classic
    );

    bar.start(images.length, 0);

    const images_chunks = chunk(images, tasksInOneCommand);
    let done = 0;

    await Promise.all(
        images_chunks.map(async (images_chunk) => {
            const command = images_chunk
                .map((image) => {
                    const guide_target = path.join(input_frames_dir, image);
                    const output = path.join(output_frames_dir, image);
                    return `${ebsynth_path} -style ${style} -guide ${source_frame} ${guide_target} -output ${output}`;
                })
                .join(' & ');

            await limited_run(command);
            done += images_chunk.length;
            bar.update(done);
        })
    );
    bar.stop();
};

const main = async () => {
    await run_ebsynth();
};

main();
