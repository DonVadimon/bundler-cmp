import path from 'path';
import fs from 'fs';
import parseArgs from 'args-parser';

export const ALL_MEASURE_MODES = ['build', 'watch', 'server'] as const;
export type MeasureMode = (typeof ALL_MEASURE_MODES)[number];

export type MeasureArgv = { measure: MeasureMode; repeat: number };

const argv: MeasureArgv = Object.assign({}, { measure: 'build', repeat: 2 }, parseArgs(process.argv));

const mode = argv.measure === 'build' ? ('production' as const) : ('development' as const);

const setEnvVars = () => {
    process.env.NODE_ENV = mode;
};

export const ALL_BUNDLERS = ['parcel', 'rollup', 'webpack', 'vite', 'webpack-swc'] as const;
export type Bundler = (typeof ALL_BUNDLERS)[number];

const CFG_PER_DIR: Record<Bundler, string> = {
    parcel: '1',
    rollup: 'rollup.config.ts',
    webpack: 'webpack.config.ts',
    vite: 'vite.config.mts',
    'webpack-swc': 'webpack.config.ts',
};

const buildLogFilePath = (base: string) => path.resolve(base, `.${argv.measure}.log`);
const buildRawLogFilePath = (base: string) => path.resolve(base, `.${argv.measure}.raw.json`);

const CWD = process.cwd();
const CWD_BASE = path.basename(CWD);

const LOGS_DIR = path.resolve(CWD, '.logs');
const LOG_FILE = buildLogFilePath(LOGS_DIR);
const LOG_RAW_FILE = buildRawLogFilePath(LOGS_DIR);
const LOG_REPORT_FILE = path.resolve(LOGS_DIR, '.report.log');
const LOG_REPORT_RUNS_FILE = path.resolve(LOGS_DIR, '.report.json');

const SRC_FILE = path.resolve(CWD, 'src', 'index.tsx');
const BUILD_DIR = path.resolve(CWD, '.build');

const CFG_OR_LINES = CFG_PER_DIR[CWD_BASE];
const CFG = path.resolve(CWD, CFG_OR_LINES || '');

export const env = {
    argv,
    mode,
    setEnvVars,
    paths: {
        CWD,
        CWD_BASE,
        LOGS_DIR,
        LOG_FILE,
        LOG_RAW_FILE,
        LOG_REPORT_FILE,
        LOG_REPORT_RUNS_FILE,
        SRC_FILE,
        BUILD_DIR,
        CFG: fs.existsSync(CFG) ? CFG : null,
        PKG_JSON: path.resolve(CWD, 'package.json'),
        buildLogFilePath,
        buildRawLogFilePath,
    },
    // Не все сборщики дают инфу о модулях. Значение взято из webpack.Stats
    BUNDLED_MODULES: 120,

    CFG_OR_LINES: CFG_PER_DIR[CWD_BASE],

    DEV_SERVER_HOST: '127.0.0.1',
    DEV_SERVER_PORT: 8000,

    ALL_BUNDLERS,
};
