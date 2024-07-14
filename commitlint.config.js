import conventionalConfig from "npm:@commitlint/config-conventional"
import parserPreset from "npm:conventional-changelog-conventionalcommits"

const config = {
    ...conventionalConfig,
    ...{ parserPreset: await parserPreset() }
};

export default config