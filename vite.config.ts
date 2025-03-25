// vite.config.ts
import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
    base: "/idle-ts/",
    resolve: {
        alias: {
            '@': resolve(__dirname, './src')
        },
    }
});