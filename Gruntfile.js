module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> - <%= pkg.author %> */\n'
      },
      build: {
        files : {
          'uploadk.min.js' : 'uploadk.js'
        }
      }
    },

    concat: {
      dist: {
        src: ['src/fileCatcher.js', 'src/*.js'],
        dest: './uploadk.js',
      }
    },

  });
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.registerTask('default', ['concat', 'uglify']);
};