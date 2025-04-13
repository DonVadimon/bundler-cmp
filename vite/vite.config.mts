import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import checker from 'vite-plugin-checker';

import {type Plugin} from 'vite';
import fs from 'fs/promises';
import path from 'path';

const writeToDisk: () => Plugin = () => ({
    name: 'write-to-disk',
    apply: 'serve',
    configResolved: async config => {
        config.logger.info('Writing contents of public folder to disk', {timestamp: true});
        await fs.cp(config.publicDir, config.build.outDir, {recursive: true});
    },
    handleHotUpdate: async ({file, server: {config, ws}, read}) => {
        if (path.dirname(file).startsWith(config.publicDir)) {
            const destPath = path.join(config.build.outDir, path.relative(config.publicDir, file));
            config.logger.info(`Writing contents of ${file} to disk`, {timestamp: true});
            await fs.access(path.dirname(destPath)).catch(() => fs.mkdir(path.dirname(destPath), {recursive: true}));
            await fs.writeFile(destPath, await read());
        }
    },
});

// https://vitejs.dev/config/
export default defineConfig({
    clearScreen: false,
    build: { outDir: '.build' },
    server: {
        host: '127.0.0.1',
        port: 8000,
        open: false,
    },
    plugins: [
        react(),
        checker({
            typescript: true,
        }),
        writeToDisk(),
    ],
});
