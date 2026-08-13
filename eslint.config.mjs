import js from "@eslint/js";
import typescriptEslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import globals from "globals";

export default [
    {
        ignores: [
            "dist",
            "dev",
            "node_modules",
            ".tmp",
            "index.js",
            "kernel.js",
            "index.css",
        ],
    },
    js.configs.recommended,
    ...typescriptEslint.configs["flat/recommended"],
    {
        languageOptions: {
            globals: {
                ...globals.node,
                ...globals.browser,
            },
            parser: tsParser,
        },
        plugins: {
            "@typescript-eslint": typescriptEslint,
        },
        rules: {
            semi: [2, "always"],
            quotes: [2, "double", {
                avoidEscape: true,
            }],
            "@typescript-eslint/no-unused-vars": ["warn", {caughtErrors: "none"}],
            "no-async-promise-executor": "off",
            "no-prototype-builtins": "off",
            "no-useless-escape": "off",
            "no-irregular-whitespace": "off",
            "@typescript-eslint/ban-ts-comment": "off",
            "@typescript-eslint/no-var-requires": "off",
            "@typescript-eslint/explicit-function-return-type": "off",
            "@typescript-eslint/explicit-module-boundary-types": "off",
            "@typescript-eslint/no-explicit-any": "off",
            "@typescript-eslint/no-require-imports": "off",
        },
    },
];
