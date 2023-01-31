const { exec } = require('child_process');
const path = require('path');
const is_cuda_available = async () => {
    const resp = await new Promise((resolve) => {
        exec('nvcc --version', (err, stdout, stderr) => {
            if (err) {
                resolve('');
            } else {
                resolve(stdout);
            }
        });
    });
    const output =  resp;

    return output.includes('nvcc: NVIDIA (R) Cuda compiler driver')
}

const current_OS = () => {
    return process.platform;
}


const get_ebsynth_binary_path = async () => {
    const os = current_OS();
    const is_cuda = await is_cuda_available();
    let binary = '';
    if (os === 'win32' || os === 'win64') {
        binary = 'ebsynth_windows';
    } else if (os === 'linux') {
        binary = 'ebsynth_linux';
    } else if (os === 'darwin') {
        binary = 'ebsynth_darwin';
    }

    if (is_cuda) {
        binary += '_cuda';
    }
    else {
        binary += '_cpu';
    }

    return path.join(__dirname, 'bin', binary);
}

module.exports = {
    is_cuda_available,
    current_OS,
    get_ebsynth_binary_path
}