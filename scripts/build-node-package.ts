// ex. scripts/build_npm.ts
import { build, emptyDir } from 'https://deno.land/x/dnt@0.38.1/mod.ts';

await emptyDir('./npm');

await build({
    entryPoints: [ './mod.ts' ],
    outDir: './npm',
    shims: {
        // see JS docs for overview and more options
        deno: true,
    },
    declaration: 'separate',
    scriptModule: 'cjs',
    esModule: true,
    packageManager: 'pnpm',
    test: false,
    package: {
        // package.json properties
        version: Deno.args[0],
        description: 'Your package.',
        license: 'MIT',
        repository: {
            type: 'git',
            url: 'git+https://github.com/username/repo.git',
        },
        bugs: {
            url: 'https://github.com/username/repo/issues',
        },
        name: 'binary-parser',
        type: 'module',
        keywords: [],
        author: '',
        dependencies: {
            '@codec-bytes/ascii': '^3.0.0',
            'reflect-metadata': '^0.1.13',
        },
    },
    postBuild() {
        // steps to run after building and before running the tests
        // Deno.copyFileSync("LICENSE", "npm/LICENSE");
        // Deno.copyFileSync("README.md", "npm/README.md");
    },
});
