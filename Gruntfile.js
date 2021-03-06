module.exports = function(grunt) {
  var buildPlatforms = parseBuildPlatforms(grunt.option('platforms'));

  grunt.initConfig({
    coffee: {
      compileBare: {
        options: {
          bare: true
        },
        files: {
          'js/app.js': ['coffee/-*.coffee', 'coffee/app.coffee', 'coffee/_*.coffee'] // compile and concat into single file
        }
      }
    },
    compass: {
      dist: {
        options: {
          cssDir: 'css'
        },
        files: {
          'css/app.css': 'sass/app.sass'
        }
      }
    },
    uglify: {
      my_target: {
        files: {
          'js/app.js': 'js/app.js'
        }
      }
    },
    cssmin: {
      minify: {
        files: {
          'css/app.css': 'css/app.css'
        }
      }
    },
    shell: {
      runnw: {
        options: {
          stdout: true
        },
        command: './build/cache/mac/0.9.2/node-webkit.app/Contents/MacOS/node-webkit . --debug'
      }
    },
    nodewebkit: {
      options: {
        version: '0.9.2',
        build_dir: './build', // Where the build version of my node-webkit app is saved
        mac_icns: './images/icon.icns', // Path to the Mac icon file
        mac: buildPlatforms.mac,
        win: buildPlatforms.win,
        linux32: buildPlatforms.linux32,
        linux64: buildPlatforms.linux64
      },
      src: ['./css/**', './fonts/**', './images/**', './js/**', './node_modules/**', '!./node_modules/grunt*/**', './index.html', './package.json'] // Your node-webkit app './**/*'
    },
    copy: {
      main: {
        files: [
          {
            src: 'libraries/win/ffmpegsumo.dll',
            dest: 'build/releases/HipHop/win/HipHop/ffmpegsumo.dll',
            flatten: true
          },
          {
            src: 'libraries/win/ffmpegsumo.dll',
            dest: 'build/cache/win/<%= nodewebkit.options.version %>/ffmpegsumo.dll',
            flatten: true
          },
          {
            src: 'libraries/mac/ffmpegsumo.so',
            dest: 'build/releases/HipHop/mac/HipHop.app/Contents/Frameworks/node-webkit Framework.framework/Libraries/ffmpegsumo.so',
            flatten: true
          },
          {
            src: 'libraries/mac/ffmpegsumo.so',
            dest: 'build/cache/mac/<%= nodewebkit.options.version %>/node-webkit.app/Contents/Frameworks/node-webkit Framework.framework/Libraries/ffmpegsumo.so',
            flatten: true
          },
          {
            src: 'libraries/linux64/libffmpegsumo.so',
            dest: 'build/releases/HipHop/linux64/HipHop/libffmpegsumo.so',
            flatten: true
          },
          {
            src: 'libraries/linux64/libffmpegsumo.so',
            dest: 'build/cache/linux64/<%= nodewebkit.options.version %>/libffmpegsumo.so',
            flatten: true
          }
        ]
      }
    }
  });
  
  grunt.loadNpmTasks('grunt-contrib-coffee');
  grunt.loadNpmTasks('grunt-contrib-compass');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-shell');
  grunt.loadNpmTasks('grunt-node-webkit-builder');

  grunt.registerTask('default', ['compass', 'coffee']);
  grunt.registerTask('obfuscate', ['uglify', 'cssmin']);
  grunt.registerTask('nodewkbuild', ['nodewebkit', 'copy:main']);

  grunt.registerTask('run', ['default', 'shell']);
  grunt.registerTask('build', ['default', 'obfuscate', 'nodewkbuild']);

};

var parseBuildPlatforms = function(argumentPlatform) {
  // this will make it build no platform when the platform option is specified
  // without a value which makes argumentPlatform into a boolean
  var inputPlatforms = argumentPlatform || process.platform + ";" + process.arch;

  // Do some scrubbing to make it easier to match in the regexes bellow
  inputPlatforms = inputPlatforms.replace("darwin", "mac");
  inputPlatforms = inputPlatforms.replace(/;ia|;x|;arm/, "");

  var buildAll = /^all$/.test(inputPlatforms);

  var buildPlatforms = {
    mac: /mac/.test(inputPlatforms) || buildAll,
    win: /win/.test(inputPlatforms) || buildAll,
    linux32: /linux32/.test(inputPlatforms) || buildAll,
    linux64: /linux64/.test(inputPlatforms) || buildAll
  };

  return buildPlatforms;
}
