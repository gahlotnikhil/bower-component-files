'use strict';
var path = require('path');
var assert = require('chai').assert;
var mockery = require('mockery');
var sinon = require('sinon');
var _ =require('underscore');

var main;

var BOWER_DIRECTORY = '.' + path.sep + 'bower_components';

var fsMock = {
  readFileSync: function(filepath, options) {
    var depjson = {};
    _.each(dependencyBower, function(json, name) {
      var componentPath = path.resolve(BOWER_DIRECTORY, name, 'bower.json');
      if (filepath == componentPath) {
        depjson = json;
      }
    });
    return JSON.stringify(depjson);
  },
  existsSync: function(path) {
    return true;
  },
  readdirSync: function(sourceDir) {
    return [
      'dist/jquery.js',
      'dist/jquery.css'
    ];
  }
};

var bowerJSON, dependencyBower;

var bowerCompFiles;
describe('bower-component-files', function() {

  before(function() {
      mockery.enable({
          // warnOnReplace: false,
          warnOnUnregistered: false
      });

      bowerJSON = {
        dependencies: {
          'angular': '^1.5.7',
          'angular-resource': '^1.5.7',
          'fullcalendar': '^2.8.0',
          'jquery': '2.2.4'
        }
      };

      dependencyBower = {
        angular: {
          name: 'angular',
          main: 'angular.js'
        },
        'angular-resource': {
          name: 'angular-resource',
          main: './angular-resource.js'
        },
        fullcalendar: {
          name: 'fullcalendar',
          main: [
            'dist/fullcalendar.js',
            'dist/fullcalendar.css'
          ]
        },
        jquery: {
          name: 'jquery',
          main: 'dist/jquery.js'
        }
      }
  });

  beforeEach(function() {
    // mocks for bowerConfig & fs-extra
    mockery.registerMock(path.resolve(process.cwd(), 'bower.json'), bowerJSON);
    mockery.registerMock('fs-extra', fsMock);
    // mockery.registerAllowable('async');

    // Loading main module under test
    bowerCompFiles = require('../lib/main');
  });

  afterEach(function() {
    // Deregister all Mockery mocks from node's module cache
    mockery.deregisterAll();
  });

  after(function() {
    // Disable Mockery after tests are completed
    mockery.disable();
  });

  describe('getMainFiles', function() {

      it('should get all the main files mentioned under main property of each bower dependency', function() {
        var filter = ['*.js', '*.css', '*.less'];
        var options = {};
        var files = bowerCompFiles.getMainFiles(filter, options);

        assert.equal(files.length, 5);
      });

      it('should exclude files/expression specified in options', function() {
        var filter = ['*.js', '*.css', '*.less'];
        var options = {exclude: 'angular*'};
        var files = bowerCompFiles.getMainFiles(filter, options);

        assert.equal(files.length, 3);

      });

      it('should exclude files/expression specified in options', function() {
        var filter = ['*'];
        var options = {exclude: 'angular*'};
        var files = bowerCompFiles.getMainFiles(filter, options);

        assert.equal(files.length, 3);

      });

      it('should include files/expression specified in options', function() {
        var filter = ['*'];
        var options = {include: 'angular*'};
        var files = bowerCompFiles.getMainFiles(filter, options);

        assert.equal(files.length, 2);
      });

      it('should get all the files mentioned under main property of each bower dependency', function() {
        var filter = ['*.js', '*.css', '*.less'];
        var options = {};
        var files = bowerCompFiles.getMainFiles(filter, options);

        assert.equal(files.length, 5);
      });
  });

  describe('getComponentFiles', function() {

      it('should get component files from specified component under specified directory', function() {
        var filter = ["dist/*.js", "dist/*.css"];
        var options = {};
        var files = bowerCompFiles.getComponentFiles('jquery', filter, options);

        assert.equal(files.length, 2);
      });

  });

  // TODO
  // Add more scenarios

});
