import {svelte} from "@sveltejs/vite-plugin-svelte";
import fg from "fast-glob";
import {
    existsSync,
    rmSync,
    statSync,
} from "fs";
import {resolve} from "path";
import {defineConfig} from "vite";
import {viteStaticCopy} from "vite-plugin-static-copy";
import zipPack from "vite-plugin-zip-pack";

const env = process.env;
const isSrcmap = env.VITE_SOURCEMAP === "inline";
const isDev = env.NODE_ENV === "development";
const outputDir = isDev ? "dev" : "dist";

console.log("isDev=>", isDev);
console.log("isSrcmap=>", isSrcmap);
console.log("outputDir=>", outputDir);

export default defineConfig(async () => {
    let livereload;
    if (isDev) {
        try {
            livereload = (await import("rollup-plugin-livereload")).default;
        } catch (error) {
            console.warn("Live reload is unavailable:", error);
        }
    }

    return {
        resolve: {
            alias: {
                "@": resolve(__dirname, "src"),
            },
        },
        plugins: [
            svelte(),
            viteStaticCopy({
                targets: [
                    {src: "./README*.md", dest: "./"},
                    {src: "./plugin.json", dest: "./"},
                    {src: "./preview.png", dest: "./"},
                    {src: "./icon.png", dest: "./"},
                    {src: "./i18n/*.json", dest: "./i18n"},
                ],
            }),
        ],
        define: {
            "process.env.DEV_MODE": JSON.stringify(isDev),
            "process.env.NODE_ENV": JSON.stringify(env.NODE_ENV),
        },
        build: {
            outDir: outputDir,
            emptyOutDir: false,
            minify: true,
            sourcemap: isSrcmap ? "inline" : false,
            lib: {
                entry: resolve(__dirname, "src/index.ts"),
                fileName: "index",
                formats: ["cjs"],
            },
            rollupOptions: {
                plugins: isDev ?
                    [
                        ...(livereload ? [livereload(outputDir)] : []),
                        watchExternalFiles([
                            "i18n/**",
                            "./README*.md",
                            "./plugin.json",
                        ]),
                    ] :
                    [
                        cleanupDistFiles({
                            patterns: ["i18n/*.yaml", "i18n/*.md"],
                            distDir: outputDir,
                        }),
                        zipPack({
                            inDir: "./dist",
                            outDir: "./",
                            outFileName: "package.zip",
                        }),
                    ],
                external: ["siyuan", "process"],
                output: {
                    entryFileNames: "[name].js",
                    assetFileNames: (assetInfo) => assetInfo.name === "style.css" ? "index.css" : assetInfo.name,
                },
            },
        },
    };
});

function watchExternalFiles(patterns: string[]) {
    return {
        name: "watch-external",
        async buildStart() {
            const files = await fg(patterns);
            for (const file of files) {
                this.addWatchFile(file);
            }
        },
    };
}

function cleanupDistFiles(options: {patterns: string[]; distDir: string;}) {
    const {patterns, distDir} = options;

    return {
        name: "rollup-plugin-cleanup",
        enforce: "post" as const,
        writeBundle: {
            sequential: true,
            order: "post" as const,
            async handler() {
                const distPatterns = patterns.map((pattern) => `${distDir}/${pattern}`);
                console.debug("Cleanup searching patterns:", distPatterns);

                const files = await fg(distPatterns, {
                    dot: true,
                    absolute: true,
                    onlyFiles: false,
                });

                for (const file of files) {
                    try {
                        if (existsSync(file)) {
                            if (statSync(file).isDirectory()) {
                                rmSync(file, {recursive: true});
                            } else {
                                rmSync(file);
                            }
                            console.log(`Cleaned up: ${file}`);
                        }
                    } catch (error) {
                        console.error(`Failed to clean up ${file}:`, error);
                    }
                }
            },
        },
    };
}
