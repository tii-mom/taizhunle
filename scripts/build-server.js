#!/usr/bin/env node
/**
 * Server build script using esbuild
 * Skips type checking for faster Railway deployments
 */

import { build } from 'esbuild';
import { readdirSync, statSync } from 'fs';
import { join, relative } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

function getAllTsFiles(dir, fileList = []) {
  const files = readdirSync(dir);
  
  files.forEach(file => {
    const filePath = join(dir, file);
    if (statSync(filePath).isDirectory()) {
      getAllTsFiles(filePath, fileList);
    } else if (file.endsWith('.ts') && !file.endsWith('.d.ts')) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

async function buildServer() {
  try {
    console.log('🔨 Building server with esbuild...');
    
    // Collect all TypeScript files from required directories
    const directories = ['server', 'config', 'constants', 'types', 'utils'];
    const allFiles = [];
    
    for (const dir of directories) {
      const dirPath = join(rootDir, 'src', dir);
      const files = getAllTsFiles(dirPath).map(f => relative(rootDir, f));
      allFiles.push(...files);
      console.log(`  ${dir}: ${files.length} files`);
    }

    console.log(`\nTotal: ${allFiles.length} TypeScript files`);

    await build({
      entryPoints: allFiles,
      bundle: false,
      platform: 'node',
      target: 'node20',
      format: 'esm',
      outdir: 'dist',
      outbase: 'src',
      sourcemap: true,
    });

    console.log('✅ Server build complete!');
  } catch (error) {
    console.error('❌ Server build failed:', error);
    process.exit(1);
  }
}

buildServer();
