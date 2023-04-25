const { exec } = require('child_process');
const { program } = require('commander');
const fs = require('fs');
const { join } = require('path');


program
  .option('-video <string>').parse(process.argv);

const { Video } = program.opts();


const main = async () => {
    let frames = await fs.promises.readdir(join(Video, 'counted_frames'));

    frames = frames.sort();
    let cmnd = `ffmpeg`;

    for(let frame of frames) {
        cmnd += ` -i ${Video}/counted_frames/${frame}`;
    }
    cmnd += ` -filter_complex "[0:v][1:v][2:v][3:v][4:v][5:v][6:v][7:v][8:v]`
    cmnd += `xstack=inputs=9:layout=0_0|w0_0|w0+w1_0|0_h0|w0_h0|w0+w1_h0|0_h0+h1|w0_h0+h1|w0+w1_h0+h1" ${Video}/sprite.png -y`;

    console.log(cmnd);
    await new Promise((resolve, reject) => {
        exec(cmnd, (err, stdout, stderr) => {
            if(err){
                return reject(err)
            }
            return resolve(stdout, stderr)
        });
    })
    
}

main();