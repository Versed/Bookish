'use strict';
var LIVERELOAD_PORT = 35729;
var lrSnippet = require('connect-livereload')({port: LIVERELOAD_PORT});
var mountFolder = function (connect, dir) {
  return connect.static(require('path').resolve(dir));
};

module.exports = function(grunt) {
  require('load-grunt-tasks')(grunt);

  grunt.initConfig({
    watch: {
      options: {
        nospawn: true,
        livereload: { liveCSS: false }
      },
      livereload: {
        options: {
          livereload: true
        },
        files: [
          './app/*.html',
          './app/elements/{,*/}*.html',
          '{.tmp,./app}/elements/{,*/}*.css',
          '{.tmp,./app}/styles/{,*/}*.css',
          '{.tmp,./app}/scripts/{,*/}*.js',
          './app/images/{,*/}*.{png,jpg,jpeg,gif,webp}'
        ]
      },
      js: {
        files: ['./app/scripts/{,*/}*.js'],
        tasks: []
      },
      styles: {
        files: [
          './app/styles/{,*/}*.css',
          './app/elements/{,*/}*.css'
        ],
        tasks: ['copy:styles', 'autoprefixer:server']
      },
      sass: {
        files: [
          './app/styles/{,*/}*.{scss,sass}',
          './app/elements/{,*/}*.{scss,sass}'
        ],
        tasks: ['sass:server', 'autoprefixer:server']
      }
    },
    sass: {
      options: {
        loadPath: './app/components'
      },
      dist: {
        options: {
          style: 'compressed'
        },
        files: [{
          expand: true,
          cwd: './app',
          src: ['styles/{,*/}*.{scss,sass}', 'elements/{,*/}*.{scss,sass}'],
          dest: 'dist',
          ext: '.css'
        }]
      },
      server: {
        files: [{
          expand: true,
          cwd: './app',
          src: ['styles/{,*/}*.{scss,sass}', 'elements/{,*/}*.{scss,sass}'],
          dest: '.tmp',
          ext: '.css'
        }]
      }
    },
    autoprefixer: {
      options: {
        browsers: ['last 2 versions']
      },
      server: {
        files: [{
          expand: true,
          cwd: '.tmp',
          src: '**/*.css',
          dest: '.tmp'
        }]
      },
      dist: {
        files: [{
          expand: true,
          cwd: 'dist',
          src: ['**/*.css', '!./app/components/**/*.css'],
          dest: 'dist'
        }]
      }
    },
    connect: {
      options: {
        port: 9000,
        // change this to '0.0.0.0' to access the server from outside
        hostname: 'localhost'
      },
      livereload: {
        options: {
          middleware: function (connect) {
            return [
              lrSnippet,
              mountFolder(connect, '.tmp'),
              mountFolder(connect, './app')
            ];
          }
        }
      },
      test: {
        options: {
          middleware: function (connect) {
            return [
              mountFolder(connect, './app')
            ];
          },
          keepalive: true
        }
      },
      dist: {
        options: {
          middleware: function (connect) {
            return [
              mountFolder(connect, 'dist')
            ];
          }
        }
      }
    },
    clean: {
      dist: ['.tmp', 'dist/*'],
      server: '.tmp'
    },
    useminPrepare: {
      html: './app/index.html',
      options: {
        dest: 'dist'
      }
    },
    usemin: {
      html: ['dist/{,*/}*.html'],
      css: ['dist/styles/{,*/}*.css'],
      options: {
        dirs: ['dist'],
        blockReplacements: {
          vulcanized: function (block) {
            return '<link rel="import" href="' + block.dest + '">';
          }
        }
      }
    },
    vulcanize: {
      default: {
        options: {
          strip: true
        },
        files: {
          'dist/elements/elements.vulcanized.html': [
            'dist/elements/elements.html'
          ]
        }
      }
    },
    imagemin: {
      dist: {
        files: [{
          expand: true,
          cwd: './app/images',
          src: '{,*/}*.{png,jpg,jpeg}',
          dest: 'dist/images'
        }]
      }
    },
    minifyHtml: {
      options: {
        quotes: true,
        empty: true
      },
      app: {
        files: [{
          expand: true,
          cwd: 'dist',
          src: '*.html',
          dest: 'dist'
        }]
      }
    },
    copy: {
      dist: {
        files: [{
          expand: true,
          dot: true,
          cwd: './app',
          dest: 'dist',
          src: [
            '*.{ico,txt}',
            '.htaccess',
            '*.html',
            'elements/**',
            '!elements/**/*.scss',
            'images/{,*/}*.{webp,gif}',
            './app/components/**'
          ]
        }]
      },
      styles: {
        files: [{
          expand: true,
          cwd: './app',
          dest: '.tmp',
          src: ['{styles,elements}/{,*/}*.css']
        }]
      }
    },
  });

  grunt.registerTask('default', ['serve']);
  grunt.registerTask('serve', [
    'clean:server',
    'sass:server',
    'copy:styles',
    'autoprefixer:server',
    'connect:livereload',
    'watch'
  ]);

  grunt.registerTask('test', [
    'clean:server',
    'connect:test'
  ]);

  grunt.registerTask('build', [
    'clean:dist',
    'sass',
    'copy',
    'useminPrepare',
    'imagemin',
    'concat',
    'autoprefixer',
    'uglify',
    'vulcanize',
    'usemin',
    'minifyHtml'
  ]);
};
