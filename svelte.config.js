/*
 * Copyright (c) 2024 by frostime. All Rights Reserved.
 * @Author       : frostime
 * @Date         : 2023-05-19 19:49:13
 * @FilePath     : /svelte.config.js
 * @LastEditTime : 2024-04-19 19:01:55
 * @Description  :
 */

const noWarns = new Set([
    "a11y-click-events-have-key-events",
    "a11y-no-static-element-interactions",
    "a11y-no-noninteractive-element-interactions",
]);

export default {
    // Consult https://svelte.dev/docs#compile-time-svelte-preprocess
    // for more information about preprocessors
    // No Svelte components currently require preprocessing; enable vitePreprocess() when adding them.
    preprocess: [],
    onwarn: (warning, handler) => {
        // Suppress warnings on `vite dev` and `vite build`; without this, things still work.
        if (noWarns.has(warning.code)) return;
        handler(warning);
    },
};
