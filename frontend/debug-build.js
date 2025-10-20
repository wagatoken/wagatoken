#!/usr/bin/env node

// Debug script to help troubleshoot Netlify build issues
console.log('=== Build Environment Debug ===');
console.log('Node version:', process.version);
console.log('Platform:', process.platform);
console.log('Architecture:', process.arch);
console.log('CWD:', process.cwd());

console.log('\n=== Environment Variables ===');
const envVars = Object.keys(process.env).filter(key => 
  key.startsWith('NEXT_PUBLIC_') || 
  key.startsWith('NETLIFY_') ||
  key.includes('NODE') ||
  key.includes('NPM')
).sort();

envVars.forEach(key => {
  const value = process.env[key];
  if (key.includes('JWT') || key.includes('SECRET') || key.includes('KEY')) {
    console.log(`${key}=${value ? `[HIDDEN - ${value.length} chars]` : 'undefined'}`);
  } else {
    console.log(`${key}=${value || 'undefined'}`);
  }
});

console.log('\n=== File System Check ===');
const fs = require('fs');
const path = require('path');

const checkPaths = [
  'package.json',
  'next.config.js',
  'tailwind.config.js',
  'postcss.config.js',
  'tsconfig.json',
  'utils/smartContracts.ts',
  'utils/verificationMonitor.ts',
  'utils/systemFallbacks.ts',
  'node_modules/tailwindcss',
  'node_modules/autoprefixer',
  'node_modules/postcss'
];

checkPaths.forEach(filePath => {
  try {
    const exists = fs.existsSync(filePath);
    const stats = exists ? fs.statSync(filePath) : null;
    console.log(`${filePath}: ${exists ? (stats.isDirectory() ? 'DIR' : 'FILE') : 'MISSING'}`);
  } catch (err) {
    console.log(`${filePath}: ERROR - ${err.message}`);
  }
});

console.log('\n=== Package Dependencies Check ===');
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const criticalDeps = ['tailwindcss', 'autoprefixer', 'postcss', 'next', 'react'];
  
  criticalDeps.forEach(dep => {
    const inDeps = packageJson.dependencies?.[dep];
    const inDevDeps = packageJson.devDependencies?.[dep];
    console.log(`${dep}: ${inDeps ? `deps@${inDeps}` : ''}${inDevDeps ? ` devDeps@${inDevDeps}` : ''}${!inDeps && !inDevDeps ? 'MISSING' : ''}`);
  });
} catch (err) {
  console.log('Error reading package.json:', err.message);
}

console.log('\n=== Debug Complete ===');