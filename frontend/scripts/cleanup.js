// cleanup.js
// Attempt to remove problematic native module and node_modules to allow a clean reinstall
const fs = require('fs');
const path = require('path');

function safeUnlink(p) {
  try {
    if (fs.existsSync(p)) {
      fs.unlinkSync(p);
      console.log('Removed:', p);
      return true;
    }
  } catch (err) {
    console.error('Failed to remove:', p);
    console.error(err && err.message ? err.message : err);
    return false;
  }
  return false;
}

function safeRmdir(p) {
  try {
    if (fs.existsSync(p)) {
      fs.rmSync(p, { recursive: true, force: true });
      console.log('Removed directory:', p);
      return true;
    }
  } catch (err) {
    console.error('Failed to remove directory:', p, err && err.message ? err.message : err);
    return false;
  }
  return false;
}

const repoRoot = path.resolve(__dirname, '..');
const problematic = path.join(repoRoot, 'node_modules', '@next', 'swc-win32-x64-msvc', 'next-swc.win32-x64-msvc.node');
const nodeModules = path.join(repoRoot, 'node_modules');
const lockfile = path.join(repoRoot, 'package-lock.json');

console.log('Running cleanup script from', repoRoot);

let ok = safeUnlink(problematic);
if (!ok) {
  console.log('Could not remove the native module directly. Trying to remove entire node_modules...');
  const removed = safeRmdir(nodeModules);
  if (!removed) {
    console.error('Failed to remove node_modules. Please run PowerShell as Administrator and run the commands in DEPLOYMENT.md.');
    process.exitCode = 2;
  } else {
    try {
      if (fs.existsSync(lockfile)) {
        fs.unlinkSync(lockfile);
        console.log('Removed lockfile:', lockfile);
      }
    } catch (err) {
      console.warn('Failed to remove lockfile:', err && err.message ? err.message : err);
    }
    console.log('\nCleanup complete. Run `npm ci` or `npm install` now.');
  }
} else {
  console.log('Native module removed. You can now run `npm ci` or `npm install`.');
}
