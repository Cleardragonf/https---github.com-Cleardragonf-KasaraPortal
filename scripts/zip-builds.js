const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

const directoriesToZip = [
    { name: 'frontend', source: './custom-build/frontend', output: './custom-build/frontend.zip' },
    { name: 'backend', source: './custom-build/backend', output: './custom-build/backend.zip' },
    { name: 'proxyserver', source: './custom-build/proxy-server', output: './custom-build/proxyserver.zip' },
];

directoriesToZip.forEach(({ name, source, output }) => {
    if (!fs.existsSync(source)) {
        console.error(`Source directory for ${name} does not exist: ${source}`);
        return;
    }

    const outputZip = fs.createWriteStream(output);
    const archive = archiver('zip', { zlib: { level: 9 } });

    outputZip.on('close', () => {
        console.log(`${name} has been zipped. Total size: ${archive.pointer()} bytes`);

        // Delete files in the source directory
        fs.readdir(source, (err, files) => {
            if (err) {
                console.error(`Failed to read directory ${source}:`, err);
                return;
            }

            files.forEach((file) => {
                const filePath = path.join(source, file);
                fs.rm(filePath, { recursive: true, force: true }, (err) => {
                    if (err) {
                        console.error(`Failed to delete ${filePath}:`, err);
                    }
                });
            });

            // Move the zip file into the source directory
            const zipFileName = path.basename(output);
            const destination = path.join(source, zipFileName);
            fs.rename(output, destination, (err) => {
                if (err) {
                    console.error(`Failed to move ${output} to ${destination}:`, err);
                } else {
                    console.log(`Moved ${output} to ${destination}`);
                }
            });
        });
    });

    archive.on('error', (err) => {
        throw err;
    });

    archive.pipe(outputZip);
    archive.directory(source, false);
    archive.finalize();
});
