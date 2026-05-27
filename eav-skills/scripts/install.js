#!/usr/bin/env node

/**
 * EAV Skill Installer
 *
 * Installs the EAV skill to ~/.claude/skills/eav-skill
 * Creates a symlink from the global skills directory to this project's skills directory.
 *
 * Usage:
 *   node install.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const TARGET_DIR = path.join(process.env.HOME || process.env.USERPROFILE, '.claude', 'skills', 'eav-skill');
const SOURCE_DIR = path.join(__dirname, '..');

function main() {
    console.log('EAV Skill Installer');
    console.log('==================');
    console.log(`Source: ${SOURCE_DIR}`);
    console.log(`Target: ${TARGET_DIR}`);
    console.log();

    // Check if source directory exists
    if (!fs.existsSync(SOURCE_DIR)) {
        console.error(`Error: Source directory not found: ${SOURCE_DIR}`);
        process.exit(1);
    }

    // Remove existing target if it exists
    if (fs.existsSync(TARGET_DIR)) {
        console.log(`Removing existing target: ${TARGET_DIR}`);
        try {
            const stats = fs.lstatSync(TARGET_DIR);
            if (stats.isSymbolicLink()) {
                fs.unlinkSync(TARGET_DIR);
            } else {
                fs.rmSync(TARGET_DIR, { recursive: true, force: true });
            }
        } catch (err) {
            console.error(`Error removing existing target: ${err.message}`);
            process.exit(1);
        }
    }

    // Create parent directory if it doesn't exist
    const parentDir = path.dirname(TARGET_DIR);
    if (!fs.existsSync(parentDir)) {
        console.log(`Creating parent directory: ${parentDir}`);
        fs.mkdirSync(parentDir, { recursive: true });
    }

    // Create symlink
    console.log(`Creating symlink: ${TARGET_DIR} -> ${SOURCE_DIR}`);
    try {
        fs.symlinkSync(SOURCE_DIR, TARGET_DIR, 'dir');
        console.log('✓ Symlink created successfully');
    } catch (err) {
        console.error(`Error creating symlink: ${err.message}`);
        console.log();
        console.log('Falling back to directory copy...');

        // Fallback: copy files instead of symlink
        try {
            execSync(`cp -r "${SOURCE_DIR}" "${TARGET_DIR}"`);
            console.log('✓ Files copied successfully');
        } catch (copyErr) {
            console.error(`Error copying files: ${copyErr.message}`);
            process.exit(1);
        }
    }

    console.log();
    console.log('Installation complete!');
    console.log(`The EAV skill is now available at: ${TARGET_DIR}`);
    console.log();
    console.log('To use this skill, Claude Code will automatically detect it.');
    console.log('If you need to update the skill, simply modify files in the source directory.');
}

main();
