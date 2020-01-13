import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { resolve } from "path";
import * as prettier from "prettier";
import * as rimraf from "rimraf";

const [, , packageName] = process.argv;

if (!packageName) {
  throw new Error("Required package name. Usage: npm run new {package-name}");
}

const lernaJson: { version: string } = JSON.parse(readFileSync(resolve(__dirname, "..", "lerna.json"), "utf8"));
const rootPackageJson: any = JSON.parse(readFileSync(resolve(__dirname, "..", "package.json"), "utf8"));
const packagesDir = resolve(__dirname, "..", "packages");
const packageDir = resolve(packagesDir, packageName.replace(/^nest-/g, ""));

if (existsSync(packageDir)) {
  throw new Error("Already exists: " + packageName);
}

const tsconfig = {
  compilerOptions: { baseUrl: "./src", outDir: "./dist" },
  exclude: ["node_modules", "coverage", "dist", "scripts"],
  extends: "../../tsconfig.base.json",
};

const tsconfigBuild = {
  compilerOptions: { baseUrl: "./src", outDir: "./dist" },
  exclude: ["node_modules", "coverage", "dist", "scripts", "src/**/*.spec.ts"],
  extends: "../../tsconfig.base.json",
};

const README = `# @anchan828/${packageName}

## Install

\`\`\`shell
npm i @anchan828/${packageName}
\`\`\`

## Usage

\`\`\`typescript
\`\`\`
`;

const packageJson = {
  author: "anchan828 <anchan828@gmail.com>",
  bugs: rootPackageJson.bugs,
  description: "> TODO: description",
  directories: {
    dist: "dist",
  },
  files: ["dist"],
  homepage: `${rootPackageJson.homepage}/tree/master/packages/${packageName.replace(/^nest-/g, "")}#readme`,
  license: "MIT",
  main: "./dist/index.js",
  name: "@anchan828/" + packageName,
  repository: rootPackageJson.repository,
  scripts: {
    build: "node ../../node_modules/typescript/bin/tsc -p tsconfig.build.json",
    "build:watch": "node ../../node_modules/typescript/bin/tsc --watch",
    "copy:license": "cp ../../LICENSE ./",
    lint: "node ../../node_modules/eslint/bin/eslint --ignore-path ../../.eslintignore '**/*.ts' '**/*.spec.ts'",
    "lint:fix": "npm run lint -- --fix",
    prepublishOnly: "rm -rf dist && npm run build && rm -f dist/*.tsbuildinfo && npm run copy:license",
    test: "node ../../node_modules/jest/bin/jest --coverage --logHeapUsage --runInBand",
    "test:debug": "node --inspect-brk node_modules/.bin/jest --runInBand --logHeapUsage",
    "test:watch": "node ../../node_modules/jest/bin/jest --watch",
    watch: "node ../../node_modules/typescript/bin/tsc -w",
  },
  types: "./dist/index.d.ts",
  version: lernaJson.version,
};

const jestConfig = `// eslint-disable-next-line @typescript-eslint/no-var-requires
const jestBaseConfig = require("../../jest.config.base");

module.exports = {
  rootDir: "src",
  ...jestBaseConfig,
};
`;

const eslintConfig = `// eslint-disable-next-line @typescript-eslint/no-var-requires
const baseESLintConfig = require("../../.eslintrc");
const path = require("path");

module.exports = {
  ...baseESLintConfig,
}
`;

const prettierConfig = `// eslint-disable-next-line @typescript-eslint/no-var-requires
const basePrettierConfig = require("../../.prettierrc");

module.exports = {
  ...basePrettierConfig,
}
`;

const npmignore = `*
dist/*.tsbuildinfo
!dist/**/*
`;

try {
  rimraf.sync(packageDir);
  mkdirSync(packageDir);
  mkdirSync(resolve(packageDir, "src"));
  writeFileSync(resolve(packageDir, "src", "index.ts"), "", "utf8");
  writeFileSync(resolve(packageDir, "jest.config.js"), jestConfig, "utf8");
  writeFileSync(resolve(packageDir, "package.json"), JSON.stringify(packageJson, null, 2), "utf8");
  writeFileSync(
    resolve(packageDir, "tsconfig.build.json"),
    prettier.format(JSON.stringify(tsconfigBuild), { parser: "json" }),
    "utf8",
  );
  writeFileSync(
    resolve(packageDir, "tsconfig.json"),
    prettier.format(JSON.stringify(tsconfig), { parser: "json" }),
    "utf8",
  );
  writeFileSync(resolve(packageDir, "README.md"), README, "utf8");
  writeFileSync(resolve(packageDir, ".npmignore"), npmignore, "utf8");
  writeFileSync(resolve(packageDir, ".eslintrc.js"), prettier.format(eslintConfig, { parser: "babel" }), "utf8");
  writeFileSync(resolve(packageDir, ".prettierrc.js"), prettier.format(prettierConfig, { parser: "babel" }), "utf8");
} catch (e) {
  console.error(e);
  rimraf.sync(packageDir);
}
