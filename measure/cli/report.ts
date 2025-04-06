import path from 'path';
import fs from 'fs';

import { MeasureMode, env, Bundler, ALL_MEASURE_MODES, ALL_BUNDLERS } from '../env';
import { format, CollectingLogs } from '../log';

const readRawLogs = async (bundler: Bundler) => {
    const logs: Record<MeasureMode, CollectingLogs> = {} as any;

    for (const mode of ALL_MEASURE_MODES) {
        const raw = await fs.promises.readFile(
            env.paths.buildRawLogFilePath(path.resolve(env.paths.CWD, bundler, '.logs')),
            {
                encoding: 'utf-8',
            },
        );
        logs[mode] = JSON.parse(raw);
    }

    return logs;
};

type BundlerLogs = Awaited<ReturnType<typeof readRawLogs>>;

type AllRawLogs = Record<Bundler, BundlerLogs>;

const readAllRawLogs = async () => {
    const allLogs: AllRawLogs = {} as any;
    for (const bundler of ALL_BUNDLERS) {
        allLogs[bundler] = await readRawLogs(bundler);
    }

    return allLogs;
};

const getHumanReadableBundlerLog = async (bundler: Bundler, rawLogs: BundlerLogs) => {
    return [
        `--- ${bundler} ---`,
        '',
        format.formatCfgLogs(rawLogs.build),
        '',
        format.formatPluginsLogs(rawLogs.build),
        '',
        format.formatProdBuildSpeed(rawLogs.build),
        '',
        format.formatDevServerLaunch(rawLogs.server),
        '',
        format.formatHMRSpeed(rawLogs.watch),
        '',
        format.formatProdBuildSize(rawLogs.build),
    ]
        .flat()
        .join('\n');
};

const processHumanReadableLogs = async (allRawLogs: AllRawLogs) => {
    const logs: string[] = [];

    for (const bundler of ALL_BUNDLERS) {
        const bundlerLogs = await getHumanReadableBundlerLog(bundler, allRawLogs[bundler]);
        logs.push(bundlerLogs);
    }

    fs.writeFileSync(env.paths.LOG_REPORT_FILE, logs.join('\n\n'), { encoding: 'utf-8' });
};

const getTimeSeriesBundlerLog = async (bundler: Bundler, rawLogs: Awaited<ReturnType<typeof readRawLogs>>) => {
    return {
        [bundler]: {
            build: { series: rawLogs.build.runs.map(({ build }) => build), mean: rawLogs.build.meanRunTime },
            server: { series: rawLogs.server.runs.map(({ build }) => build), mean: rawLogs.server.meanRunTime },
            watch: { series: rawLogs.watch.runs.map(({ build }) => build), mean: rawLogs.watch.meanRunTime },
        },
    };
};

const processRunLogs = async (allRawLogs: AllRawLogs) => {
    let logs = {};

    for (const bundler of ALL_BUNDLERS) {
        const bundlerLogs = await getTimeSeriesBundlerLog(bundler, allRawLogs[bundler]);
        logs = Object.assign(logs, bundlerLogs);
    }

    fs.writeFileSync(env.paths.LOG_REPORT_RUNS_FILE, JSON.stringify(logs, null, 4), { encoding: 'utf-8' });
};

(async () => {
    const allRawLogs = await readAllRawLogs();
    await processHumanReadableLogs(allRawLogs);
    await processRunLogs(allRawLogs);
})();
