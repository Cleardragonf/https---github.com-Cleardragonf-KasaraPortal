const { series } = require('gulp');
const { exec } = require('child_process');

function buildFrontend(cb) {
  exec('npm run build --prefix src', (err, stdout, stderr) => {
    console.log(stdout);
    console.error(stderr);
    cb(err);
  });
}

function buildBackend(cb) {
  exec('npm run build --prefix backend', (err, stdout, stderr) => {
    console.log(stdout);
    console.error(stderr);
    cb(err);
  });
}

function buildProxy(cb) {
  exec('npm run build --prefix proxy-server', (err, stdout, stderr) => {
    console.log(stdout);
    console.error(stderr);
    cb(err);
  });
}

exports.build = series(buildFrontend, buildBackend, buildProxy);
