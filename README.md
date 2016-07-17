# bower-component-files
[![NPM version][npm-image]][npm-url] [![Dependency Status][daviddm-image]][daviddm-url] [![devDependency Status][daviddm-image-dev]][daviddm-url-dev] [![Build Status][travis-image]][travis-url] [![Build Status][appveyor-image]][appveyor-url] [![Build Status][codecov-image]][codecov-url]

## Synopsis

bower-component-files is used to copy/fetch dependency files (js, css, less, etc) from bower dependency packages to a web application directory. Following functions are available.

1. bowerComponentFiles.copyMainFiles(filter : Array&lt;String&gt;/Object, options : Object)

  The method copies main files that match regular expression, to the corresponding destination.

  eg:
  ```js
    bowerComponentFiles.copyMainFiles({"*.js": "./webapp/vendor/{{comp_name}}/js",
                              "*.css": "./webapp/vendor/{{comp_name}}/css",
                              "*.less": "./webapp/vendor/{{comp_name}}/less"},
                              { exclude: '*boot*.js' });

  ```
2. bowerComponentFiles.copyComponentFiles(filter : Array&lt;String&gt;/Object, options : Object)

  The method copies files from specified directory under specified component/package to the corresponding destination. This method is used to copy files not mentioned as main files in bower.json.

  eg:
  ```js
    bowerComponentFiles.copyComponentFiles("moment", {'*.js': './webapp/vendor/{{comp_name}}/js'});
  ```

3. bowerComponentFiles.getMainFiles(filter : Array&lt;String&gt;, options : Object) : Array&lt;String&gt;

  The method fetches main files that match regular expression, which can be fed to gulp to process further.

  eg:
  ```js
    gulp.src(bowerComponentFiles.getMainFiles(["*.js", "*.css"],)).pipe(  gulp.dest( 'dest/lib'));

  ```

4. bowerComponentFiles.getComponentFiles(filter : Array&lt;String&gt;, options : Object) : Array&lt;String&gt;

  eg:
  ```js

    gulp.src(bowerComponentFiles.getComponentFiles('jquery',
     ["dist/*.js", "dist/*.css"], {})).pipe(gulp.dest('dest/lib'));

  ```

Filter eg:

```js

1. {
      "*.js": "./webapp/js",
      "*.css": "./webapp/css",
      "*.less": "./webapp/less"
      // ...
   }
2. {
      "*.js": "./webapp/vendor/{{comp_name}}/js",
      "*.css": "./webapp/vendor/{{comp_name}}/css",
      "*.less": "./webapp/vendor/{{comp_name}}/less"
      // ...
    }
    // Note: Currently comp_name & comp_version are supported.

3. ["*.js", "*.css"]
    // Note: Default destination is '.' in this case. Every extention would
    // create a sub-directory.
    // This would be compiled as
    {
        "*.js": "./js",
        "*.css": "./css",
    }

```

## Installation

```bash
npm install bower-component-files
```
## Usage

```js
var bowerComponentFiles = require('bower-component-files');

bowerComponentFiles.copyMainFiles({ "*.js": "./webapp/js",
                                    "*.css": "./webapp/css",
                                    "*.less": "./webapp/less"
                                  },
                                  { exclude: '*boot*.js' });
```

## Testing
```bash
[sudo] npm test
```

With test coverage:
```bash
[sudo] npm test --coverage
```

## License

The MIT License (MIT)

Copyright (c) 2016 Nikhil Gahlot

[npm-image]: https://badge.fury.io/js/bower-component-files.svg
[npm-url]: https://npmjs.org/package/bower-component-files

[daviddm-image]: https://david-dm.org/gahlotnikhil/bower-component-files.svg
[daviddm-url]: https://david-dm.org/gahlotnikhil/bower-component-files

[daviddm-image-dev]: https://david-dm.org/gahlotnikhil/bower-component-files/dev-status.svg
[daviddm-url-dev]: https://david-dm.org/gahlotnikhil/bower-component-files#info=devDependencies

[travis-image]: https://img.shields.io/travis/gahlotnikhil/bower-component-files/master.svg?label=linux/os
[travis-url]: https://travis-ci.org/gahlotnikhil/bower-component-files

[appveyor-image]: https://img.shields.io/appveyor/ci/gahlotnikhil/bower-component-files/master.svg?label=windows
[appveyor-url]: https://ci.appveyor.com/project/gahlotnikhil/bower-component-files

[codecov-image]: https://codecov.io/gh/gahlotnikhil/bower-component-files/branch/master/graph/badge.svg
[codecov-url]: https://codecov.io/gh/gahlotnikhil/bower-component-files
