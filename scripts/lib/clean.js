import path from "node:path";
import fsp from "node:fs/promises";
import { rimraf } from "rimraf";
import { dst } from "./path-helper.js";

export async function cleanAsync() {

    console.info(` > Cleaning "${dst()}"...`);

    const globPattern = dst("**/*").replace(/\\/g, "/");

    await rimraf(globPattern, {
        glob: true
    });
}
