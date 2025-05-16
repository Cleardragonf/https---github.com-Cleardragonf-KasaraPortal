const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const buildDir = path.join(__dirname, '../custom-build');

// Ensure the custom build directory exists
if (!fs.existsSync(buildDir)) {
  console.log(`Creating custom build directory: ${buildDir}`);
  fs.mkdirSync(buildDir, { recursive: true });
}

// Helper function to copy files
function copyFiles(src, dest) {
  if (!fs.existsSync(src)) {
    console.error(`Source directory does not exist: ${src}`);
    return;
  }
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  fs.readdirSync(src).forEach((file) => {
    const srcPath = path.join(src, file);
    const destPath = path.join(dest, file);
    if (fs.lstatSync(srcPath).isDirectory()) {
      copyFiles(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
      console.log(`Copied: ${srcPath} -> ${destPath}`);
    }
  });
}

// Copy a single file
function copyFile(src, dest) {
  if (!fs.existsSync(src)) {
    console.error(`File does not exist: ${src}`);
    return;
  }
  const destDir = path.dirname(dest);
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }
  fs.copyFileSync(src, dest);
  console.log(`Copied: ${src} -> ${dest}`);
}

// Build frontend
console.log('Building frontend...');
execSync('npm run build', { stdio: 'inherit' }); // Run the root build script for the frontend
const frontendBuildDir = path.join(__dirname, '../build'); // Default React build output directory
const frontendTargetDir = path.join(buildDir, 'frontend');
copyFiles(frontendBuildDir, frontendTargetDir);
copyFile(path.join(__dirname, '../src/package.json'), path.join(frontendTargetDir, 'package.json')); // Copy frontend package.json

// Build backend
console.log('Building backend...');
execSync('npm run build --prefix backend', { stdio: 'inherit' });
const backendBuildDir = path.join(__dirname, '../backend/dist');
const backendTargetDir = path.join(buildDir, 'backend');
copyFiles(backendBuildDir, backendTargetDir);
copyFile(path.join(__dirname, '../backend/package.json'), path.join(backendTargetDir, 'package.json')); // Copy backend package.json

// Build proxy-server
console.log('Building proxy-server...');
execSync('npm run build --prefix proxy-server', { stdio: 'inherit' });
const proxyServerBuildDir = path.join(__dirname, '../proxy-server/dist');
const proxyServerTargetDir = path.join(buildDir, 'proxy-server');
copyFiles(proxyServerBuildDir, proxyServerTargetDir);
copyFile(path.join(__dirname, '../proxy-server/package.json'), path.join(proxyServerTargetDir, 'package.json')); // Copy proxy-server package.json

// Copy versions.json
console.log('Copying versions.json...');
const versionsJsonPath = path.join(__dirname, '../config/versions.json');
const configTargetDir = path.join(buildDir, 'config');

if (!fs.existsSync(versionsJsonPath)) {
  console.error(`Error: versions.json not found at ${versionsJsonPath}`);
  process.exit(1); // Exit the script with an error code
}

if (!fs.existsSync(configTargetDir)) {
  fs.mkdirSync(configTargetDir, { recursive: true });
}

fs.copyFileSync(versionsJsonPath, path.join(configTargetDir, 'versions.json'));
console.log('Copied versions.json to custom-build/config');

console.log('Custom build completed successfully!');
