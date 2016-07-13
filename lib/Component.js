(function () {
  'use strict';

  /**
   * Class to represent individual component.
   * @constructor
   * @param {Object} bowerObj
   * @param {Array<String>} files
   */
  function Component(bowerObj, files) {
    this.bowerObj = bowerObj;
    this.files = files;
    this.name = bowerObj['name'];
    this.version = bowerObj['version'];
  };


  Component.prototype = {
  }

  module.exports = Component;

})();
