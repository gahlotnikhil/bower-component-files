(function () {
'use strict';

  var bower = require('bower');
  var path = require('path');
  var _ =require('underscore');
  var fs = require('fs-extra');
  var minimatch = require('minimatch');

  var Component = require('./Component');

  //TODO
  //Add another user option to specify this.
  var BOWER_DIRECTORY = '.' + path.sep + 'bower_components';
  //TODO
  //Add another user option to specify this.
  var DEFAULT_DEST_ROOT = '.';

  _.templateSettings = {
    interpolate: /\{\{(.+?)\}\}/g
  };

  var bowerConfig = require(path.resolve(process.cwd(), 'bower.json'));

  var bowerCompFiles = [];

  /**
   * Fetch main files that match regular expression
   * Use Options.include or options.exclude to include or exclude set of files
   * return files. You can use gulp.pipe() to process it further.
   *
   * @param  {Object}/{Array} filter
   *         Filter eg:
   *          1. ["*.js", "*.css"]
   * @param  {Object} options
   *         Options eg:
   *         1. {exclude: '*angular*.js'}
   *         2. {include: 'boot*.js'}
   * @return {Array<String>} List of file paths
   */
  bowerCompFiles.getMainFiles = function(filter, options) {
    if (_.isArray(filter)) {
      var filterAsObject = {};
      _.each(filter, function(expression) {
        filterAsObject[expression] = '';
      });

      var components = fetchComponents(filterAsObject,options);

      var files = [];
      _.each(components, function(comp) {
        Array.prototype.push.apply(files, comp.files);
      });
      return files;
    }
    return [];
  };

  /**
   * Fetch files from specified component under specified directory
   * Uses Options.include or Options.exclude to include or exclude set of files
   * return files. You can use gulp.pipe() to process it further.
   *
   * @param  {String} compName. A component name.
   * @param  {Object}/{Array} filter
   *         Filter eg:
   *          1. ["*.js", "*.css"]
   * @param  {Object} options
   *         Options eg:
   *         1. {exclude: '*angular*.js'}
   *         2. {include: 'boot*.js'}
   * @return {Array<String>} List of file paths
   */
  bowerCompFiles.getComponentFiles = function(componentName, filter, options) {
    if (_.isArray(filter)) {
      var filterAsObject = {};
      _.each(filter, function(expression) {
        filterAsObject[expression] = '.';
      });

      var component = fetchComponent(componentName, filterAsObject,options);

      return component.files;
    }
    return [];
  };

  /**
   * Fetch main files that match regular expression
   * Use Options.include or Options.exclude to include or exclude set of files
   * Copy files from each regular expression to destination directory
   * returns nothing
   *
   * @param  {Object}/{Array} filter
   *         Filter eg:
   * 		      1. {
   * 					   	"*.js": "./webapp/js",
   * 			  	  	"*.css": "./webapp/css",
   * 			  	   	"*.less": "./webapp/less"
   * 			  	   	...
   * 			       }
   * 		      2. {
   * 					   	"*.js": "./webapp/vendor/{{comp_name}}/js",
   *      		  	"*.css": "./webapp/vendor/{{comp_name}}/css",
   *        	  	"*.less": "./webapp/vendor/{{comp_name}}/less"
   *        	  	...
   *             }
   *          Note: Currently comp_name & comp_version are supported.
   *
   *          3. ["*.js", "*.css"]
   *          Note: Default destination is '.' in this case. Every extention would
   *          create a sub-directory.
   *          This would be compiled as
   *          {
   * 					   	"*.js": "./js",
   * 			  	  	"*.css": "./css",
   * 			  	}
   * @param  {Object} options
   *         Options eg:
   *         1. {exclude: '*angular*.js'}
   *         2. {include: 'boot*.js'}
   * @return void
   */
  bowerCompFiles.copyMainFiles = function(filter, options) {

    var components = [];
    if (_.isObject(filter) || _.isArray(filter)) {

      if (_.isArray(filter)) {

        var filterAsObject = {};
        _.each(filter, function(expression) {
          var fileInfo = path.parse(expression);

          filterAsObject[expression] = path.resolve(DEFAULT_DEST_ROOT, fileInfo.ext.substring(1));
        });

        filter = filterAsObject;
      }

    }
    components = fetchComponents(filter,options);

    copyComponents(components,filter);
  };

  /**
   * Fetch files from specified component under specified directory
   * Uses Options.include or Options.exclude to include or exclude set of files
   * Copy files to destination directory
   * returns nothing
   *
   * @param  {String} compName. A component name.
   * @param  {Object} filter
   *         Filter eg:
   * 		      1. {
   * 					   	"*.js": "./webapp/js",
   * 			  	  	"*.css": "./webapp/css",
   * 			  	   	"*.less": "./webapp/less"
   * 			  	   	...
   * 			       }
   *
   * 		      2. {
   * 					   	"*.js": "./webapp/vendor/{{comp_name}}/js",
   *      		  	"*.css": "./webapp/vendor/{{comp_name}}/css",
   *        	  	"*.less": "./webapp/vendor/{{comp_name}}/less"
   *        	  	...
   *             }
   *
   * @param  {Object} options
   *         Options eg:
   *         1. {exclude: '*angular*.js'}
   *         2. {include: 'boot*.js'}
   * @return void
   */
  bowerCompFiles.copyComponentFiles = function(compName, filter, options) {
    var components = fetchComponent(compName,filter,options);

    copyComponents([components],filter);
  };

  /**
   * Get components from bower.json
   * @param  {Object}/{Array} filter
   * @param  {Object} options
   * @return {Array<Component>} List of components
   */
  function fetchComponents(filter, options) {
    console.log('Fetching dependencies...');

    var componentList = [];

    if (_.isObject(filter) || _.isArray(filter)) {
      var dependencies = fetchBowerComponents();
      _.each(dependencies, function(dep) {
        var bowerObj = getBower(dep);
        if (bowerObj) {
          var mainFiles = fetchMainFiles(bowerObj);

          var componentFiles = [];
          _.each(filter, function(destDir, expression) {
            var expressionObj = {};
            expressionObj[expression] = destDir;

            var filteredValues = filterByExpression(mainFiles, expressionObj, options);
            Array.prototype.push.apply(componentFiles,
              filteredValues);
          });

          // create Component class and encapsulate Component
          // related info in that.
          componentList.push(new Component(bowerObj, componentFiles));

          console.log(componentFiles.length + ' file(s) found for ' + dep);
        }
      });

      console.log('##### Total dependencie(s) found ' + componentList.length);
    }

    return componentList;
  }

  /**
   * Constructs a Component object
   * @param  {String} compName
   * @param  {Object} filter
   * @param  {Object} options
   * @return {Component}
   */
  function fetchComponent(compName, filter, options) {
    var componentFiles = [];
    _.each(filter, function(destDir, expression) {
      var fileInfo = path.parse(path.resolve(BOWER_DIRECTORY, compName, expression));
      var sourceDir = fileInfo.dir;

      var dirContent = fs.readdirSync(sourceDir);
      var expressionObj = {};
      expressionObj[expression] = destDir;

      dirContent = dirContent.map(function(file) {
        return path.resolve(BOWER_DIRECTORY, compName, file);
      });

      Array.prototype.push.apply(componentFiles,
        filterByExpression(dirContent, expressionObj, options));

    });
    var bowerObj = getBower(compName);
    return new Component(bowerObj, componentFiles);
  }

  /**
   * @return {Array<String>}
   */
  function fetchBowerComponents() {
    var dependencies = bowerConfig['dependencies'];

    dependencies = _.map(dependencies, function(version, comp){
      return comp;
    });
    return dependencies;
  }

  /**
   *
   * @param  {Object} bowerObj
   * @return {Array<String>}
   */
  function fetchMainFiles(bowerObj) {
    var mainFiles = resolveObjToArray(bowerObj['main']);
    var name = bowerObj['name'];
    return mainFiles.map(function(file) {
      return path.resolve(BOWER_DIRECTORY, name, file);
    });
  }

  function getBower(name) {
    var componentPath = path.join(BOWER_DIRECTORY, path.sep, name);

    if(!fs.existsSync(path.resolve(componentPath, 'bower.json'))) {
      return null;
    }
    return JSON.parse(fs.readFileSync(path.resolve(componentPath, 'bower.json'),
          'utf8'));
  }

  /**
   * @param  {Array<String>} filePaths
   * @param  {Object} expression
   * @param  {Object} options
   * @return {Array<String>} filtered paths
   */
  function filterByExpression(filePaths, expression, options) {

    var expressionValue = _.findKey(expression);
    var optionalExpression;
    optionalExpression = options['include'];

    var optionalExpression;
    if (options['include']) {
      optionalExpression = [options['include']];
    } else if (options['exclude']){
      optionalExpression = [options['exclude']];
    }

    var filteredPaths = filterValues(filePaths, expressionValue);

    if (optionalExpression) {
      filteredPaths = filterValues(filteredPaths, '!' + optionalExpression);
    }

    return filteredPaths;
  }

  /**
   * @param  {Array<String>} values
   * @param  {Object} expression
   * @return {Array<String>} filtered values
   */
  function filterValues(values, expression) {

    if (typeof expression === 'string') {
      values = _.filter(values, function(filePath){

        return minimatch(filePath, expression, { matchBase: true });
      });
    } else if (expression instanceof RegExp) {
      values = _.filter(values, function(filePath){
        return expression.test(filePath);
      });
    }
    return values;
  }

  /**
   * @param  {Array<String>} filePaths
   * @param  {String} dest
   * @return {Array<String>} Files copied
   */
  function copyFiles(filePaths, dest) {

    var filesCopied = [];
    _.each(filePaths, function(filePath) {
      var fileInfo = path.parse(filePath);
      if (!fileInfo) {
        // Show error
        console.error('Error occured while copying file: ' + filePath);
        return;
      }
      var fileName = fileInfo.base;

      try {

        try {
          fs.copySync(filePath,
            path.resolve(dest,fileName));
          fs.chmodSync(dest, '777');
          console.log('success!');
        } catch (err) {
          console.error(err)
        }

        filesCopied.push(filePath);

        console.log('File ' + filePath + ' copied successfully to ' + path.resolve(dest,fileName));
      } catch(err) {
        console.error('Error occured while copying file: ' + filePath);
      }
    });

    return filesCopied;
  }

  function fileExists(filename){
    try{
      fs.accessSync(filename)
      return true;
    }catch(e){
      return false;
    }
  }

  /**
   *
   * @param  {Array<String>} componentList
   * @param  {Object} filter
   */
  function copyComponents(componentList, filter) {
    console.log('Copying files...');

    var totalFilesCopied = [];
    _.each(componentList, function(comp) {

      var files = comp.files;

      _.each(filter, function(dest, expression) {

        // Expect variable to be in {{...}} format
        var template = _.template(dest);
        dest = template({comp_name: comp.name, comp_version: comp.version});

        var filesCopied = copyFiles(filterValues(files, expression), dest);

        Array.prototype.push.apply(totalFilesCopied, filesCopied);

      });
    });

    console.log('######### ' + totalFilesCopied.length + ' file(s) copied #########');
  }

  function resolveObjToArray(obj) {
    if (_.isArray(obj)) {
      return obj;
    } else if (_.isString(obj)) {
      return [obj];
    }

    return [];
  }

  module.exports = bowerCompFiles;
})();
