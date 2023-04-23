import path from "node:path";

function createResolveFn(folder) {
    return p => path.resolve(`${folder}/${p ?? ""}`);
}

export const root = createResolveFn("./");
export const src = createResolveFn("./src/");
export const dst = createResolveFn("./dist/");
