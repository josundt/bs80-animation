import path from "node:path";
import fsp from "node:fs/promises";
import { src, dst } from "./path-helper.js";

export function copyAssetsAsync() {

    console.info(` > Copying assets to "${dst("")}"...`);

    return Promise.all([
        "images/bare_saa_80_logo_nobg.svg",
    ].map(
        async f => {
            const s = src(f);
            const d = dst(f);
            const dDir = path.dirname(d);
            try {
                await fsp.access(dDir);
            } catch {
                await fsp.mkdir(path.dirname(d));
            }
            await fsp.copyFile(s, d);
        }
    ));

}
