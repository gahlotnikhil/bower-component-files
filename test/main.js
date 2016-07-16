'use strict';
var path = require('path');
var assert = require('chai').assert;
var expect = require('chai').expect
var mockery = require('mockery');
var sinon = require('sinon');
var _ =require('underscore');

var main;

var ROOT_DIRECTORY = '.';
var BOWER_DIRECTORY = ROOT_DIRECTORY + path.sep + 'bower_components';

// var sandbox = sinon.sandbox.create();

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
  },
  // copySync: sandbox.stub(),
  copySync: function(filePath, destFilePath) {
    // console.log(filePath + ' ======== ' + destFilePath);
  },
  chmodSync: function(dest, mode) {

  }
};

var bowerJSON, dependencyBower;
var spy;

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

    // Loading main module under test
    bowerCompFiles = require('../lib/main');
    spy = sinon.spy(fsMock, "copySync");
  });

  afterEach(function() {
    // Deregister all Mockery mocks from node's module cache
    mockery.deregisterAll();

    fsMock.copySync.restore();
  });

  after(function() {
    // Verify all Sinon mocks have been honored
    // sandbox.verifyAndRestore();
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

      it('should exclude files/expression specified in options', function() {
        var filter = ["dist/*.js", "dist/*.css"];
        var options = {exclude: '*.css'};
        var files = bowerCompFiles.getComponentFiles('jquery', filter, options);

        assert.equal(files.length, 1);
        var componentDir = path.resolve(BOWER_DIRECTORY, 'jquery');
        assert.equal(files[0], path.resolve(componentDir, 'dist/jquery.js'));
      });

      it('should include files/expression specified in options', function() {
        var filter = ['*'];
        var options = {include: '*.css'};
        var files = bowerCompFiles.getComponentFiles('jquery', filter, options);
        var componentDir = path.resolve(BOWER_DIRECTORY, 'jquery');

        assert.equal(files.length, 1);
        assert.equal(files[0], path.resolve(componentDir, 'dist/jquery.css'));
      });
  });

  describe('copyMainFiles', function() {

      it('should get all the main files mentioned under main property of each bower dependency', function() {
        var filter = {"*.js": "./webapp/js",
                      "*.css": "./webapp/css",
                      "*.less": "./webapp/less"};
        var options = {};

        spy.withArgs(path.resolve(BOWER_DIRECTORY, dependencyBower.angular.name, dependencyBower.angular.main),
              path.resolve(ROOT_DIRECTORY, filter['*.js'], path.parse(dependencyBower.angular.main).base));

        spy.withArgs(path.resolve(BOWER_DIRECTORY, dependencyBower.angular.name, dependencyBower['angular-resource'].main),
              path.resolve(ROOT_DIRECTORY, filter['*.js'], path.parse(dependencyBower['angular-resource'].main).base));

        spy.withArgs(path.resolve(BOWER_DIRECTORY, dependencyBower.fullcalendar.name, dependencyBower.fullcalendar.main[0]),
              path.resolve(ROOT_DIRECTORY, filter['*.js'], path.parse(dependencyBower.fullcalendar.main[0]).base));

        spy.withArgs(path.resolve(BOWER_DIRECTORY, dependencyBower.fullcalendar.name, dependencyBower.fullcalendar.main[1]),
              path.resolve(ROOT_DIRECTORY, filter['*.css'], path.parse(dependencyBower.fullcalendar.main[1]).base));

        spy.withArgs(path.resolve(BOWER_DIRECTORY, dependencyBower.jquery.name, dependencyBower.jquery.main),
              path.resolve(ROOT_DIRECTORY, filter['*.js'], path.parse(dependencyBower.jquery.main).base));

        bowerCompFiles.copyMainFiles(filter, options);

        assert(spy.withArgs(path.resolve(BOWER_DIRECTORY, dependencyBower.angular.name, dependencyBower.angular.main),
              path.resolve(ROOT_DIRECTORY, filter['*.js'], path.parse(dependencyBower.angular.main).base)).calledOnce);

        assert(spy.withArgs(path.resolve(BOWER_DIRECTORY, dependencyBower['angular-resource'].name, dependencyBower['angular-resource'].main),
              path.resolve(ROOT_DIRECTORY, filter['*.js'], path.parse(dependencyBower['angular-resource'].main).base)).calledOnce);

        assert(spy.withArgs(path.resolve(BOWER_DIRECTORY, dependencyBower.fullcalendar.name, dependencyBower.fullcalendar.main[0]),
              path.resolve(ROOT_DIRECTORY, filter['*.js'], path.parse(dependencyBower.fullcalendar.main[0]).base)).calledOnce);

        assert(spy.withArgs(path.resolve(BOWER_DIRECTORY, dependencyBower.fullcalendar.name, dependencyBower.fullcalendar.main[1]),
              path.resolve(ROOT_DIRECTORY, filter['*.css'], path.parse(dependencyBower.fullcalendar.main[1]).base)).calledOnce);

        assert(spy.withArgs(path.resolve(BOWER_DIRECTORY, dependencyBower.jquery.name, dependencyBower.jquery.main),
              path.resolve(ROOT_DIRECTORY, filter['*.js'], path.parse(dependencyBower.jquery.main).base)).calledOnce);

      });

      it('should exclude files/expression specified in options', function() {
        var filter = {"*.js": "./webapp/js",
                      "*.css": "./webapp/css",
                      "*.less": "./webapp/less"};
        var options = {exclude: 'angular*'};

        spy.withArgs(path.resolve(BOWER_DIRECTORY, dependencyBower.fullcalendar.name, dependencyBower.fullcalendar.main[0]),
              path.resolve(ROOT_DIRECTORY, filter['*.js'], path.parse(dependencyBower.fullcalendar.main[0]).base));

        spy.withArgs(path.resolve(BOWER_DIRECTORY, dependencyBower.fullcalendar.name, dependencyBower.fullcalendar.main[1]),
              path.resolve(ROOT_DIRECTORY, filter['*.css'], path.parse(dependencyBower.fullcalendar.main[1]).base));

        spy.withArgs(path.resolve(BOWER_DIRECTORY, dependencyBower.jquery.name, dependencyBower.jquery.main),
              path.resolve(ROOT_DIRECTORY, filter['*.js'], path.parse(dependencyBower.jquery.main).base));

        bowerCompFiles.copyMainFiles(filter, options);

        assert(spy.withArgs(path.resolve(BOWER_DIRECTORY, dependencyBower.fullcalendar.name, dependencyBower.fullcalendar.main[0]),
              path.resolve(ROOT_DIRECTORY, filter['*.js'], path.parse(dependencyBower.fullcalendar.main[0]).base)).calledOnce);

        assert(spy.withArgs(path.resolve(BOWER_DIRECTORY, dependencyBower.fullcalendar.name, dependencyBower.fullcalendar.main[1]),
              path.resolve(ROOT_DIRECTORY, filter['*.css'], path.parse(dependencyBower.fullcalendar.main[1]).base)).calledOnce);

        assert(spy.withArgs(path.resolve(BOWER_DIRECTORY, dependencyBower.jquery.name, dependencyBower.jquery.main),
              path.resolve(ROOT_DIRECTORY, filter['*.js'], path.parse(dependencyBower.jquery.main).base)).calledOnce);

      });

  });

  // TODO
  // Add more scenarios

});
