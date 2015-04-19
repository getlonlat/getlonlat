module.exports = function(grunt) {

	require('time-grunt')(grunt);

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		concat: {
			options: {
				separator: ';',
				stripBanners: { block: true, line: true },
			},
			app: {
				dest: 'build/js/app.min.js',
				src: [
					'vendor/jquery/dist/jquery.js',
					'vendor/bootstrap/dist/js/bootstrap.js',
					'vendor/angular/angular.js',
					'vendor/angular-touch/angular-touch.js',
					'vendor/angular-focus-it/angular-focus-it.js',
					'vendor/angular-route/angular-route.js',

					'app/app.js',
					'app/config.js',
					'app/routes.js',
					'app/components/home/HomeController.js',
					'app/services/MapService.js',
				]
			}
		},

		copy: {
			fonts: {
				files: [
					{
						expand: true,
						flatten: true,
						src: ['vendor/font-awesome/fonts/**.*'],
						dest: 'build/fonts'
					}
				]
			}
		},

		uglify: {
			app: {
				options: {
					mangle: false
				},
				files: {
					'build/js/app.min.js': ['build/js/app.min.js']
				}
			}
		},

		cssmin: {
			combine: {
				files: {
					'build/css/app.min.css': [
						'css/bootstrap-united.css',
						'vendor/font-awesome/css/font-awesome.css',
						'css/app.css',
					]
				}
			}
		},

		watch: {
			dev: {
				files: ['Gruntfile.js', 'app/**/*.js', 'css/**/*.css'],
				tasks: ['concat:app', 'cssmin'],
				options: {
					atBegin: true,
					liveReload: true
				}
			},
		},

		jshint: {
			all: ['Gruntfile.js', 'app/**/*.js']
		}
	});

	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-cssmin');
	grunt.loadNpmTasks('grunt-contrib-watch');

	grunt.registerTask('dev', ['concat', 'cssmin']);
	grunt.registerTask('default', ['concat',  'uglify', 'cssmin', 'copy:fonts']);
};
