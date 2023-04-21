import path from "node:path";

export const src = p => path.resolve(`./src/${p ?? ""}`);
export const dst = p => path.resolve(`./dist/${p ?? ""}`);
