import ts from "typescript";

/**
 * @param {string} modulePath The module path
 * @param {string} moduleContent The module content
 * @param {string?} configFilename The file name for the config file (default: "tsconfig.json")
 * @param {string?} cwd The current working directory (default "./")
 */
export function typescriptCompileModule(modulePath, moduleContent, configFilename = "tsconfig.json", cwd = "./"){
    const configFileName = ts.findConfigFile(cwd, ts.sys.fileExists, configFilename);
    const configFile = ts.readConfigFile(configFileName, ts.sys.readFile);
    const config = ts.parseJsonConfigFileContent(configFile.config, ts.sys, cwd);

    /** @type {ts.CompilerOptions} */
    const compilerOptions = {
        ...config.options,
        ...{
            sourceMap: false,
            inlineSourceMap: false,
            inlineSources: false,
            moduleDetection: ts.ModuleDetectionKind.Force,
            module: ts.ModuleKind.ESNext,
            moduleResolution: ts.ModuleResolutionKind.Bundler,
            isolatedModules: true
        }
    };

    const compiledModuleContent = ts.transpileModule(moduleContent, {
        compilerOptions,
        fileName: modulePath
    });

    return compiledModuleContent.outputText;

}
