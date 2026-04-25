const { execSync } = require('child_process');
const fs = require('fs');
const { processLicenseData } = require('./audit-licenses.js');

function runTests() {
    console.log('Running tests for audit-licenses script logic...');

    // Mock data
    const mockLicenseData = {
        'MIT': [
            { name: 'dep1', versions: ['1.0.0'] },
            { name: 'dep2', versions: ['2.0.0'] }
        ],
        'Apache-2.0': [
            { name: 'dep3', versions: ['3.0.0'] }
        ],
        'GPL-3.0': [
            { name: 'dep4', versions: ['4.0.0'] }
        ]
    };

    const mockDirectDeps = {
        'dep1': new Set(['pkg-a']),
        'dep3': new Set(['pkg-b'])
    };

    const result = processLicenseData(mockLicenseData, mockDirectDeps);

    // Assertions
    if (result.allUniquePackages.size !== 4) {
        throw new Error(`Expected 4 total deps, got ${result.allUniquePackages.size}`);
    }

    if (result.sortedDirectDeps.length !== 2) {
        throw new Error(`Expected 2 direct deps, got ${result.sortedDirectDeps.length}`);
    }

    if (result.flagged.length !== 2) {
        throw new Error(`Expected 2 flagged deps, got ${result.flagged.length}`);
    }

    const flaggedNames = result.flagged.map(f => f.name);
    if (!flaggedNames.includes('dep3') || !flaggedNames.includes('dep4')) {
        throw new Error(`Flagged deps should include dep3 and dep4, got ${flaggedNames.join(', ')}`);
    }

    const dep3Flag = result.flagged.find(f => f.name === 'dep3');
    if (dep3Flag.type !== '**Direct**') {
        throw new Error(`Expected dep3 to be Direct, got ${dep3Flag.type}`);
    }

    const dep4Flag = result.flagged.find(f => f.name === 'dep4');
    if (dep4Flag.type !== 'Transitive') {
        throw new Error(`Expected dep4 to be Transitive, got ${dep4Flag.type}`);
    }

    console.log('✅ Logic tests passed!');

    // Check if the actual script runs without error
    try {
        console.log('Verifying actual script execution...');
        execSync('node scripts/audit-licenses.js');
        if (!fs.existsSync('docs/LICENSE_AUDIT.md')) {
            throw new Error('LICENSE_AUDIT.md was not created');
        }
        console.log('✅ Script execution verified!');
    } catch (e) {
        console.error('❌ Script execution failed:', e.message);
        process.exit(1);
    }
}

runTests();
