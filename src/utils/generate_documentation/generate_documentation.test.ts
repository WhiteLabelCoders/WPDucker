// Copyright 2023-2024 the WPDucker authors. All rights reserved. MIT license.

import { assertEquals } from 'https://deno.land/std@0.201.0/assert/assert_equals.ts';
import { generateDocumentation } from './generate_documentation.ts';

Deno.test('generateDocumentation', async function testGenerateDocumentation(t) {
    await t.step(function fullArguments() {
        const args = {
            usage: 'my-cli [command]',
            description: 'This is a CLI tool',
            commands: [['init', 'Initialize something'], ['build', 'Build something']],
            arguments: [['path', 'Path to the file'], ['path', 'Path to the file']],
            options: [['-h, --help', 'Show help'], ['-v, --version', 'Show version']],
            colorTheme: {
                heading: '\x1b[1m',
                key: '\x1b[32m',
                description: '\x1b[0m',
            },
        };

        const result = generateDocumentation(args);

        console.log(result);

        // Assertions
        assertEquals(result.includes('my-cli [command]'), true, 'Should include usage');
        assertEquals(result.includes('This is a CLI tool'), true, 'Should include description');
        assertEquals(
            result.includes('init') && result.includes('Initialize something'),
            true,
            'Should include init command',
        );
        assertEquals(
            result.includes('build') && result.includes('Build something'),
            true,
            'Should include build command',
        );
        assertEquals(
            result.includes('path') && result.includes('Path to the file'),
            true,
            'Should include arguments',
        );
        assertEquals(
            result.includes('-h, --help') && result.includes('Show help'),
            true,
            'Should include help option',
        );
        assertEquals(
            result.includes('-v, --version') && result.includes('Show version'),
            true,
            'Should include version option',
        );
    });
    await t.step(function missingCommands() {
        const args = {
            usage: 'my-cli [command]',
            description: 'This is a CLI tool',
            commands: [],
            arguments: [['path', 'Path to the file'], ['path', 'Path to the file']],
            options: [['-h, --help', 'Show help'], ['-v, --version', 'Show version']],
            colorTheme: {
                heading: '\x1b[1m',
                key: '\x1b[32m',
                description: '\x1b[0m',
            },
        };

        const result = generateDocumentation(args);

        // Assertions
        assertEquals(result.includes('my-cli [command]'), true, 'Should include usage');
        assertEquals(result.includes('This is a CLI tool'), true, 'Should include description');
        assertEquals(
            result.includes('path') && result.includes('Path to the file'),
            true,
            'Should include arguments',
        );
        assertEquals(
            result.includes('-h, --help') && result.includes('Show help'),
            true,
            'Should include help option',
        );
        assertEquals(
            result.includes('-v, --version') && result.includes('Show version'),
            true,
            'Should include version option',
        );
    });

    await t.step(function missingArguments() {
        const args = {
            usage: 'my-cli [command]',
            description: 'This is a CLI tool',
            commands: [['init', 'Initialize something'], ['build', 'Build something']],
            arguments: [],
            options: [['-h, --help', 'Show help'], ['-v, --version', 'Show version']],
            colorTheme: {
                heading: '\x1b[1m',
                key: '\x1b[32m',
                description: '\x1b[0m',
            },
        };

        const result = generateDocumentation(args);

        // Assertions
        assertEquals(result.includes('my-cli [command]'), true, 'Should include usage');
        assertEquals(result.includes('This is a CLI tool'), true, 'Should include description');
        assertEquals(
            result.includes('init') && result.includes('Initialize something'),
            true,
            'Should include init command',
        );
        assertEquals(
            result.includes('build') && result.includes('Build something'),
            true,
            'Should include build command',
        );
        assertEquals(
            result.includes('-h, --help') && result.includes('Show help'),
            true,
            'Should include help option',
        );
        assertEquals(
            result.includes('-v, --version') && result.includes('Show version'),
            true,
            'Should include version option',
        );
    });

    await t.step(function missingOptions() {
        const args = {
            usage: 'my-cli [command]',
            description: 'This is a CLI tool',
            commands: [['init', 'Initialize something'], ['build', 'Build something']],
            arguments: [['path', 'Path to the file'], ['path', 'Path to the file']],
            options: [],
            colorTheme: {
                heading: '\x1b[1m',
                key: '\x1b[32m',
                description: '\x1b[0m',
            },
        };

        const result = generateDocumentation(args);

        // Assertions
        assertEquals(result.includes('my-cli [command]'), true, 'Should include usage');
        assertEquals(result.includes('This is a CLI tool'), true, 'Should include description');
        assertEquals(
            result.includes('init') && result.includes('Initialize something'),
            true,
            'Should include init command',
        );
        assertEquals(
            result.includes('build') && result.includes('Build something'),
            true,
            'Should include build command',
        );
        assertEquals(
            result.includes('path') && result.includes('Path to the file'),
            true,
            'Should include arguments',
        );
    });
});
