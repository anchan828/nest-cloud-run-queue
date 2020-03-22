import { readdirSync, readFileSync, writeFileSync } from "fs";
import { resolve } from "path";
import * as prettier from "prettier";

const packagesDir = resolve(__dirname, "..", "packages");
function hasTestDebug(packageName: string): boolean {
  try {
    const packageJSON = JSON.parse(readFileSync(resolve(packagesDir, packageName, "package.json"), "utf8"));
    return packageJSON.scripts["test:debug"];
  } catch {
    return false;
  }
}
const packageNames = readdirSync(packagesDir, { withFileTypes: true })
  .filter((f) => !f.isFile())
  .map((f) => f.name)
  .filter((f) => hasTestDebug(f));

const launch = {
  configurations: packageNames.map((packageName) => ({
    console: "integratedTerminal",
    cwd: "${workspaceRoot}/packages/" + packageName,
    internalConsoleOptions: "neverOpen",
    name: `${packageName} test debug`,
    port: 9229,
    request: "launch",
    runtimeArgs: ["run", "test:debug"],
    runtimeExecutable: "npm",
    sourceMaps: true,
    type: "node",
  })),
  version: "0.2.0",
};

writeFileSync(
  resolve(__dirname, "..", ".vscode", "launch.json"),
  prettier.format(JSON.stringify(launch, null, 2), { parser: "json" }),
  "utf8",
);
