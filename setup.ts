import { logger } from './src/global/logger.ts';
import { ensureFile } from "https://deno.land/std@0.224.0/fs/mod.ts";

const denoCommand = async (options: Deno.CommandOptions) => {
    logger.info(`Execute deno command ${options.args ? `"${options.args.join(' ')}"` : ''}`);

    const command = new Deno.Command("command", options);

    const process = command.spawn();

    await process.status;
};

const setup = async() => {
  logger.info("Installing husky-init...");
  await denoCommand({args: ["deno", "install", "-g", "-A", "-f", "npm:husky"]})
  
  logger.info("Initialysing husky-init...");
  await denoCommand({args: ["deno", "run", "-A", "npm:husky", "install"]})

  logger.info("Installing commit-msg...");
  const commitMsgFilename = `${Deno.cwd()}/.husky/commit-msg`
  let huskyContentCommitMsg = `#!/bin/sh\n`
  huskyContentCommitMsg += `. "$(dirname "$0")/_/husky.sh"\n`
  huskyContentCommitMsg += `deno run -A npm:@commitlint/cli --edit "$1"\n`

  await ensureFile(commitMsgFilename);
  Deno.writeTextFileSync(commitMsgFilename, huskyContentCommitMsg)
  await denoCommand({args: ["chmod", "+x", `${commitMsgFilename}`]})

  logger.success("Setup complete!");
}

setup();
