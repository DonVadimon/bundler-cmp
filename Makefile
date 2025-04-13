SM_REPEAT = 10
export SM_REPEAT

all:
	@echo "Choose task"
	exit 1

install:
	cd webpack && npm ci && cd ..
	cd rollup && npm ci && cd ..
	cd parcel && npm ci && cd ..
	cd vite && npm ci && cd ..

sm-log:
	echo "SM_REPEAT - $$SM_REPEAT"

build-wp: # build webpack
	cd webpack && npm run build

start-wp: # start webpack
	cd webpack && npm run start

sm-build-wp: sm-log # speed measure webpack build
	cd webpack && eval 'npm run sm -- --repeat=$$SM_REPEAT --measure=build'

sm-watch-wp: sm-log # speed measure webpack watch
	cd webpack && eval 'npm run sm -- --repeat=$$SM_REPEAT --measure=watch'

sm-server-wp: sm-log # speed measure webpack dev server
	cd webpack && eval 'npm run sm -- --repeat=$$SM_REPEAT --measure=server'

build-rp: # build rollup
	cd rollup && npm run build

start-rp: # start rollup
	cd rollup && npm run start

sm-build-rp: sm-log # speed measure rollup build
	cd rollup && eval 'npm run sm -- --repeat=$$SM_REPEAT --measure=build'

sm-watch-rp: sm-log # speed measure rollup watch
	cd rollup && eval 'npm run sm -- --repeat=$$SM_REPEAT --measure=watch'

sm-server-rp: sm-log # speed measure rollup dev server
	cd rollup && eval 'npm run sm -- --repeat=$$SM_REPEAT --measure=server'

build-pl: # build parcel
	cd parcel && npm run build

start-pl: # start parcel
	cd parcel && npm run start

sm-build-pl: sm-log # speed measure parcel build
	cd parcel && eval 'npm run sm -- --repeat=$$SM_REPEAT --measure=build'

sm-watch-pl: sm-log # speed measure parcel watch
	cd parcel && eval 'npm run sm -- --repeat=$$SM_REPEAT --measure=watch'

sm-server-pl: sm-log # speed measure parcel dev server
	cd parcel && eval 'npm run sm -- --repeat=$$SM_REPEAT --measure=server'

build-vt: # build vite
	cd vite && npm run build

start-vt: # start vite
	cd vite && npm run start

sm-build-vt: sm-log # speed measure vite build
	cd vite && eval 'npm run sm -- --repeat=$$SM_REPEAT --measure=build'

sm-watch-vt: sm-log # speed measure vite watch
	cd vite && eval 'npm run sm -- --repeat=$$SM_REPEAT --measure=watch'

sm-server-vt: sm-log # speed measure vite dev server
	cd vite && eval 'npm run sm -- --repeat=$$SM_REPEAT --measure=server'

build-wp-swc: # build webpack-swc
	cd webpack-swc && npm run build

start-wp-swc: # start webpack-swc
	cd webpack-swc && npm run start

sm-build-wp-swc: sm-log # speed measure webpack-swc build
	cd webpack-swc && eval 'npm run sm -- --repeat=$$SM_REPEAT --measure=build'

sm-watch-wp-swc: sm-log # speed measure webpack-swc watch
	cd webpack-swc && eval 'npm run sm -- --repeat=$$SM_REPEAT --measure=watch'

sm-server-wp-swc: sm-log # speed measure webpack-swc dev server
	cd webpack-swc && eval 'npm run sm -- --repeat=$$SM_REPEAT --measure=server'

sm-build-all: sm-build-wp sm-build-rp sm-build-pl sm-build-vt sm-build-wp-swc
	echo "🛠 build done"

sm-watch-all: sm-watch-wp sm-watch-rp sm-watch-pl sm-watch-vt sm-watch-wp-swc
	echo "👀 watch done"

sm-server-all: sm-server-wp sm-server-rp sm-server-pl sm-server-vt sm-server-wp-swc
	echo "🛜 server done"

sm-all: sm-build-all sm-watch-all sm-server-all
	echo "🚀 done"

sm-report: sm-all
	eval 'npm run report -- --repeat=$$SM_REPEAT'

clear-out:
	rm -rf ./*/.build
	rm -rf ./*/.logs
	rm -rf ./parcel/.parcel-cache
	rm -rf ./vite/node_modules/.vite
