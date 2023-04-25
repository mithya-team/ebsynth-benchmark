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

    const spriteImage = join(Video, 'sprite.png');

    const outputFolder = join(Video, 'extracted_sprites');

    await fs.promises.mkdir(outputFolder, {recursive: true});


    for(let i = 0; i < 3; i++) {
        for(let j = 0; j < 3; j++) {
            let cmnd = `ffmpeg -i ${spriteImage} -vf  "crop=iw/3:ih/3:iw*${j}/3:ih*${i}/3" ${outputFolder}/${frames[i*3+j]} -y`;
            await new Promise((resolve, reject) => {
                exec(cmnd, (err, stdout, stderr) => {
                    if(err){
                        return reject(err)
                    }
                    return resolve(stdout, stderr)
                });
            })
        }
    }

   
    
}

main();