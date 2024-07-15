import { logger } from '../global/logger.ts';

function updateCopyrights() {
    logger.debugFn(arguments);

    const currentYear = new Date(Date.now()).getFullYear();
    logger.debugVar('currentYear', currentYear);

    const copyrightLine =
        `// Copyright 2023-${currentYear} the WPDucker authors. All rights reserved. MIT license.`;
    logger.debugVar('copyrightLine', copyrightLine);

    const hasCopyrightRegexp = new RegExp(
        `// Copyright [0-9]{1,}-[0-9]{1,} the WPDucker authors. All rights reserved. MIT license.`,
    );
    logger.debugVar('hasCopyrightRegexp', hasCopyrightRegexp);

    function findTsFiles() {
        logger.debugFn(arguments);

        const path = `${Deno.cwd()}/src`;
        const ext = 'ts';
        const found: string[] = [];

        function scanDir(path: string) {
            logger.debugFn(arguments);
            for (const dirEntry of Deno.readDirSync(path)) {
                const currentPath = `${path}/${dirEntry.name}`;
                if (dirEntry.isFile && dirEntry.name.endsWith(`.${ext}`)) {
                    found.push(currentPath);
                    continue;
                }
                if (dirEntry.isDirectory) {
                    scanDir(currentPath);
                    continue;
                }
            }
        }

        scanDir(path);

        return found;
    }

    function addCopyrightToTsFile(filename: string) {
        logger.debugFn(arguments);

        const newContent = `${copyrightLine}\n\n${Deno.readTextFileSync(filename)}`;
        logger.debugVar('newContent', newContent);

        Deno.writeTextFileSync(filename, newContent);
    }

    function updateCopyrightInTsFile(filename: string) {
        logger.debugFn(arguments);

        const newContent = Deno.readTextFileSync(filename).replace(
            hasCopyrightRegexp,
            copyrightLine,
        );
        logger.debugVar('newContent', newContent);

        Deno.writeTextFileSync(filename, newContent);
    }

    function getFirstLine(filename: string) {
        logger.debugFn(arguments);

        const content = Deno.readTextFileSync(filename);
        logger.debugVar('content', content);

        const firstLine = content.replaceAll('\n\n', '\n').split('\n')[0];
        logger.debugVar('firstLine', firstLine);

        return firstLine;
    }

    function ensureCopyrightForTsFile(filename: string) {
        logger.debugFn(arguments);

        const firstLine = getFirstLine(filename);
        logger.debugVar('firstLine', firstLine);

        const hasCopyright = hasCopyrightRegexp.test(firstLine);
        logger.debugVar('hasCopyright', hasCopyright);

        if (!hasCopyright) {
            return addCopyrightToTsFile(filename);
        }

        const outDatedCopyright = !firstLine.startsWith(copyrightLine);
        logger.debugVar('outDatedCopyright', outDatedCopyright);

        if (outDatedCopyright) {
            return updateCopyrightInTsFile(filename);
        }
    }

    function updateLicense() {
        logger.debugFn(arguments);

        const filename = `${Deno.cwd()}/LICENSE`;
        logger.debugVar('filename', filename);

        const content = Deno.readTextFileSync(filename);
        logger.debugVar('content', content);

        const newContent = content.replace(
            new RegExp(`Copyright \\(c\\) [0-9]*-[0-9]* White Label Coders`),
            `Copyright (c) 2023-${currentYear} White Label Coders`,
        );
        logger.debugVar('newContent', newContent);

        Deno.writeTextFileSync(filename, newContent);
    }

    const tsFiles = findTsFiles();
    logger.debugVar('tsFiles', tsFiles);

    tsFiles.forEach((file) => {
        ensureCopyrightForTsFile(file);
    });

    updateLicense();
}

updateCopyrights();
