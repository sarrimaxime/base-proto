'use strict'

// ---------------------------------------------------------------------o modules

import gulp 				from 'gulp'
import YAML 				from 'yamljs'
import fs 					from 'fs'

import plumber				from 'gulp-plumber'
import concat 				from 'gulp-concat'
import sourcemaps 			from 'gulp-sourcemaps'
import source 				from 'vinyl-source-stream'
import buffer 				from 'vinyl-buffer'
import browserify 			from 'browserify'
import watchify 			from 'watchify'
import babelify 			from 'babelify'
import util 	 			from 'gulp-util'
import prettyHrtime 		from 'pretty-hrtime'
import browserSyncModule	from 'browser-sync';

let browserSync = browserSyncModule.get('app');
let reload = browserSync.reload;

// ---------------------------------------------------------------------o config

const config = YAML.load('./builder/config.yml')

let pack = JSON.parse(fs.readFileSync('./package.json'))
let deps = pack.dependencies


let bundler = null
let startTime = process.hrtime()

const bundle = function (dest, filename) {
	bundler.bundle()
		.on('error', (er) => {
			console.log(er.message)
		})
		.pipe(plumber())
		.pipe(source(filename))
		.pipe(buffer())
		.pipe(sourcemaps.init({loadMaps: true}))
		.pipe(sourcemaps.write('./maps'))
		.pipe(gulp.dest(dest))
		.on('end', () => {
			util.log('Finished', '\'' + util.colors.cyan('scripts') + '\'', 'after', util.colors.magenta(prettyHrtime(process.hrtime(startTime))))

			if (config.browserSync === undefined || config.browserSync.js === undefined || config.browserSync.js === true) {
				reload('*.js');
			}
		})
}


// ---------------------------------------------------------------------o task


gulp.task('scripts', () => {

	for (let script of config.scripts) {

		let external = []
		for (let dep in deps) {
			external.push(dep)
		}

		const src = config.src + script.src
		const dest = config.site + script.dest

		const b = browserify(src, {
        	paths: ['./node_modules', src],
			debug: true,
			extensions: ['.js', '.json'],
			cache: {},
			packageCache: {}
		})
		.external(external)
		.transform(babelify, {
			presets: ['es2015', 'stage-1'],
			only: [ config.src + script.folder ]
		})

		bundler = watchify(b, { poll: true })

		bundler.on( 'update', () => {
			startTime = process.hrtime()
			util.log('Running', '\'' + util.colors.cyan('scripts') + '\'...')
			bundle(dest, script.filename)
		})	

		bundle(dest, script.filename)

	}


})

gulp.task('scripts:vendor', () => {

		const dest = config.site + 'js/'

		const b = browserify({
			debug: false
		})

		for (let dep in deps) {
			b.require(dep)
		}

		b.bundle()
			.pipe(source('vendor.js'))
			.pipe(buffer())
			.pipe(sourcemaps.init({loadMaps: true}))
			.pipe(sourcemaps.write('./maps'))
			.pipe(gulp.dest(dest))

		
})






