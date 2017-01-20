'use strict';

// ---------------------------------------------------------------------o modules

import gulp 				from 'gulp';
import requireDir 			from 'require-dir';
import path 				from 'path';
import YAML 				from 'yamljs';
import browserSyncModule	from 'browser-sync';
import fs 					from 'fs';

// Init browserSync
let browserSync = browserSyncModule.create('app');

// ---------------------------------------------------------------------o require tasks

requireDir('./builder', { recurse: true });


// ---------------------------------------------------------------------o config

const config = YAML.load('./builder/config.yml');
const localConfigPath = './builder/config.local.yml';
const localConfigExists = fs.existsSync(localConfigPath);

// ---o Override the keys in the config by a config.local.yml file

if (localConfigExists === true) {
	let localConfig = YAML.load(localConfigPath);

	for (let key in localConfig) {
		if (typeof localConfig[key] === 'object') {
			for (let key2 in localConfig[key]) {
				config[key][key2] = localConfig[key][key2];
			}
		}
		else {
			config[key] = localConfig[key];
		}
	}

}

// ---------------------------------------------------------------------o default task

const taskByExtension = {
	'scss': 'styles'
};


// ---o Default task

gulp.task('default', () => {
	// Launch browser sync
	browserSync.init({
        server: {
            baseDir: "./app/"
        }
    });

	// Launch all tasks
	gulp.start('scripts:vendor');
	gulp.start('scripts');
	gulp.start('styles');

	// Launch watcher
	gulp.watch(config.src + '**/*', (event) => {

		// Will check for the extension and the file folder
		// to launch to associate task

		const ext = path.extname(event.path).substr(1);
		const pathArray = event.path.split('/');
		const folder = pathArray[pathArray.length - 2];

		let taskname = null;

		taskname = taskByExtension[ext];

		if (typeof taskname === 'object') {
			taskname = taskname[folder];
		}

		if (taskname) {
			gulp.start(taskname);
		}

	})

});
