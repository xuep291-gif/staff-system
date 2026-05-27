#!/usr/bin/env node

/**
 * EAV Skill Uninstaller
 *
 * Removes the EAV skill from ~/.claude/skills/eav-skill
 *
 * Usage:
 *   node uninstall.js
 */

const fs = require('fs');
const path = require('path');

const TARGET_DIR = path.join(process.env.HOME || process.env.USERPROFILE, '.claude', 'skills', 'eav-skill');

function main() {
    console.log('EAV Skill Uninstaller');
    console.log('====================');
    console.log(`Target: ${TARGET_DIR}`);
    console.log();

    if (!fs.existsSync(TARGET_DIR)) {
        console.log('Skill is not installed.');
        process.exit(0);
    }

    try {
        const stats = fs.lstatSync(TARGET_DIR);

        if (stats.isSymbolicLink()) {
            console.log('Removing symlink...');
            fs.unlinkSync(TARGET_DIR);
            console.log('✓ Symlink removed successfully');
        } else {
            console.log('Removing directory...');
            fs.rmSync(TARGET_DIR, { recursive: true, force: true });
            console.log('✓ Directory removed successfully');
        }

        console.log();
        console.log('Uninstallation complete!');
        console.log('The EAV skill has been removed from your system.');
    } catch (err) {
        console.error(`Error removing skill: ${err.message}`);
        process.exit(1);
    }
}

main();
