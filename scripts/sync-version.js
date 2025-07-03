#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read version from root package.json (single source of truth)
const rootPackageJsonPath = path.join(__dirname, '../package.json');
const rootPackageJson = JSON.parse(fs.readFileSync(rootPackageJsonPath, 'utf8'));
const version = rootPackageJson.version;

console.log(`🔄 Syncing version ${version} across all files...`);

// Files to update with version
const filesToUpdate = [
  // Package.json files
  'package.json',
  'apps/@sparrow-desktop/package.json',
  'apps/@sparrow-web/package.json',
  'packages/@sparrow-common/package.json',
  'packages/@sparrow-library/package.json',
  'packages/@sparrow-support/package.json',
  'packages/@sparrow-teams/package.json',
  'packages/@sparrow-types/package.json',
  'packages/@sparrow-workspaces/package.json',
  // Tauri config
  'apps/@sparrow-desktop/src-tauri/tauri.conf.json'
];

let updatedFiles = 0;

filesToUpdate.forEach(filePath => {
  const fullPath = path.join(__dirname, '..', filePath);
  
  try {
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, 'utf8');
      const jsonData = JSON.parse(content);
      
      // Update version if it exists and is different
      if (jsonData.version && jsonData.version !== version) {
        jsonData.version = version;
        fs.writeFileSync(fullPath, JSON.stringify(jsonData, null, 2) + '\n');
        console.log(`✅ Updated: ${filePath}`);
        updatedFiles++;
      } else if (jsonData.version === version) {
        console.log(`⏭️  Skipped: ${filePath} (already up to date)`);
      }
    } else {
      console.log(`❌ File not found: ${filePath}`);
    }
  } catch (error) {
    console.error(`❌ Error updating ${filePath}:`, error.message);
  }
});

console.log(`\n🎉 Version sync complete! Updated ${updatedFiles} files to version ${version}`);