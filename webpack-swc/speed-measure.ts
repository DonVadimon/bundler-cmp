import webpack from 'webpack';

import { run } from '../measure/run';
import { env } from '../measure/env';
import { log } from '../measure/log';
import { git } from '../measure/git';
import { measureDevServer } from '../measure/measure-dev-server';

env.setEnvVars();

const compiler = webpack({ ...require('./webpack.config').default, cache: false });

const onBuild = (error: any, stats: webpack.Stats | undefined, run: number) => {
    if (error) {
        console.error(error);

        throw error;
    }

    if (typeof stats === 'undefined') {
        throw new Error('Starts are undefined');
    }

    log.addRunLog({
        run,
        build: stats.endTime - stats.startTime,
    });
};

const measureBuild = async () => {
    for (let index = 0; index < env.argv.repeat; index++) {
        await new Promise<void>((resolve) => {
            compiler.run((error, stats) => {
                onBuild(error, stats, index + 1);
                resolve();
            });
        });
    }
};

const measureWatch = () => {
    let run = 0;
    return new Promise<void>((resolve) => {
        const watching = compiler.watch({}, (error, stats) => {
            onBuild(error, stats, ++run);

            if (run === env.argv.repeat) {
                return watching.close(() => resolve());
            }

            git.changeSource();
        });
    });
};

run.setupMeasure({ measureBuild, measureWatch, measureDevServer })();
