# bower-component-files [![NPM version][npm-image]][npm-url]

## Synopsis

bower-component-files is used to copy/fetch dependency files (js, css, less, etc) from bower dependency packages to a web application directory. Following functions are available.

1. bowerComponentFiles.copyMainFiles(filter : Array&lt;String&gt;/Object, options : Object)

  The method copies main files that match regular expression, to the corresponding destination.

  eg:
  ```js
    bowerComponentFiles.copyMainFiles({ "*.js": "./webapp/js",
                                      "*.css": "./webapp/css",
                                      "*.less": "./webapp/less"
                                    },
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

## License

The MIT License (MIT)

Copyright (c) 2016 Nikhil Gahlot

[npm-image]: https://badge.fury.io/js/bower-component-files.svg
[npm-url]: https://npmjs.org/package/bower-component-files
