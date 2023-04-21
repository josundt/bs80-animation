import path from "node:path";
import fsp from "node:fs/promises";
import { rimraf } from "rimraf";
import { dst } from "./path-helper.js";

export async function cleanAsync() {

    console.info(` > Cleaning assets in "${dst("")}"...`);

    await rimraf(dst("**/*"), {
        glob: true
    });
}
