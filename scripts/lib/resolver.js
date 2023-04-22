import enhancedResolve from "enhanced-resolve";
import fsp from "node:fs/promises";
import { src } from "./path-helper.js";
import path from "node:path";

const resolve = enhancedResolve.create({
    // or resolve.create.sync
    extensions: [".ts", ".js"],
    modules: [src()],
    extensionAlias: {
        ".js": ".ts"
    }
    // see more options below
});

/**
 * @param {string} importExpression
 * @param {string} fromContext
 * @param {("static" | "dynamic")?} kind
 * @param {Set<[dependency: string, dependent: string, kind: "static" | "dynamic"]>?} result
 * @returns {Promise<Array<[dependency: string, dependent: string, kind: "static" | "dynamic"]>>}
 */
export async function resolveImportGraphAsync(importExpression, fromContext, kind, result) {
    const isRecursiveCall = !!kind;
    result ??= new Set();

    const modulePath = await resolveImportPathAsync(importExpression, isRecursiveCall ? path.dirname(fromContext) : fromContext);
    const moduleContent = await fsp.readFile(modulePath);

    if (isRecursiveCall) {
        result.add([modulePath, fromContext, kind])
    }

    const regexKindCollection = [
        [/import\s+.*\s+from\s+["']([^'"]+)["']/ug, "static"], // Static imports regex
        [/import\s*\(\s*["']([^'"]+)["']\s*\)/ug, "dynamic"]   // Dynamic imports regex
    ];

    let currentDeps = [];
    for (const [regex, kind] of regexKindCollection) {
        let matches;
        while ((matches = regex.exec(moduleContent)) !== null) {
            currentDeps.push([matches[1], modulePath, kind]);
        }
        regex.lastIndex = 0;
    }

    await Promise.all(currentDeps.map(
        ([dep, , kind]) => resolveImportGraphAsync(dep, modulePath, kind, result))
    );

    return isRecursiveCall ? [] : Array.from(result);
}

/**
 * @param {string} importExpression
 * @param {string} fromContext
 * @returns {Promise<string | null>}
 */
function resolveImportPathAsync(importExpression, fromContext) {
    return new Promise((res, rej) => {
        resolve(fromContext, importExpression, (err, result) => {
            if (err) {
                rej(err);
            } else {
                res(result);
            }
        });

    });
}
