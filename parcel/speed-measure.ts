import fs from 'fs';
import path from 'path';

import { Parcel } from '@parcel/core';

import { run } from '../measure/run';
import { env } from '../measure/env';
import { log } from '../measure/log';
import { git } from '../measure/git';
import { measureDevServer } from '../measure/measure-dev-server';

const rmCache = () => fs.rmSync(path.resolve(env.paths.CWD, '.parcel-cache'), { recursive: true, force: true });

const bundler = new Parcel({
    entries: 'public/index.html',
    defaultConfig: '@parcel/config-default',
    defaultTargetOptions: {
        distDir: '.build',
        sourceMaps: false,
        isLibrary: false,
    },
    mode: env.mode,
});

const measureBuild = async () => {
    for (let index = 0; index < env.argv.repeat; index++) {
        rmCache();
        const { buildTime } = await bundler.run();
        log.addRunLog({
            run: index + 1,
            build: buildTime,
        });
    }
};

const measureWatch = () => {
    let run = 0;

    return new Promise<void>((resolve) => {
        const watcher = bundler.watch((error, event) => {
            if (error) {
                throw error;
            }

            if (event?.type === 'buildSuccess') {
                log.addRunLog({
                    run: ++run,
                    build: event.buildTime,
                });

                if (run === env.argv.repeat) {
                    return watcher.then((subscription) => subscription.unsubscribe()).then(() => resolve());
                }

                git.changeSource();
            }
        });
    });
};

run.setupMeasure({ measureBuild, measureWatch, measureDevServer })();
