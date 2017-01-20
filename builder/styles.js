'use strict'

// ---------------------------------------------------------------------o modules

import gulp 				from 'gulp';
import YAML 				from 'yamljs';
import sass 				from 'gulp-sass';
import sourcemaps			from 'gulp-sourcemaps';
import autoprefixer			from 'gulp-autoprefixer';
import rename				from 'gulp-rename';
import plumber				from 'gulp-plumber';
import gulpif 				from 'gulp-if';
import browserSyncModule	from 'browser-sync';

let browserSync = browserSyncModule.get('app');
let reload = browserSync.reload;

// ---------------------------------------------------------------------o config

const config = YAML.load('./builder/config.yml');



// ---------------------------------------------------------------------o task

gulp.task('styles', () => {
	
	for (let style of config.styles) {

		const src = config.src + style.src;
		const dest = config.site + style.dest;
		let filename = style.filename.split('.');

		let stream = gulp.src(src)
			.pipe(plumber())
			.pipe(sourcemaps.init())
			.pipe(sass().on('error', sass.logError))
			.pipe(autoprefixer({
				 browsers: ['last 2 versions']
			}))
			.pipe(sourcemaps.write())
			.pipe(rename( (path) => {
				path.basename = filename[0];
				path.extname = '.' + filename[1];
			}))
			.pipe(gulp.dest(dest))

		// Inject CSS with browsersync
		stream.on('end', () => {
			if (config.browserSync === undefined || config.browserSync.css === undefined || config.browserSync.css === true) {
				reload('*.css');
			}
		});
	}

});

gulp.task('styles:prod', () => {
	
	for (let style of config.styles) {

		let src = [];
		const dest = config.site + style.dest;

		for (let path of style.src) {
			src.push(config.src + path);
		}

		gulp.src(src)
			.pipe(plumber())
			.pipe(sass({
				compress: true
			}))
			.pipe(autoprefixer({
				 browsers: ['last 2 versions']
			}))
			.pipe(gulp.dest(dest));
	}

});
