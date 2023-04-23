import fsp from "node:fs/promises";
import path from "node:path";
/**
 * Add link preload for JS files
 * @param {string} sourcePath
 * @param {string} destPath
 * @param {string} webRootPath
 * @param  {...string[]} jsFiles
 * @returns {Promise<void>}
 */
export async function buildHtmlWithPreloads(sourcePath, destPath, webRootPath, ...jsFiles) {
    const content = (await fsp.readFile(sourcePath)).toString();
    const links = jsFiles.map(
        js => `<link rel="preload" as="script" href="${path.relative(webRootPath, js).replace(/\\/ug, "/")}" crossorigin/>`
    );
    const transformed = content.replace(/<head>(\s*)/umi, (s, g1) => `<head>${g1}` + links.join(g1) + g1);
    await fsp.writeFile(destPath, transformed);
}
