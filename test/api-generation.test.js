const assert = require('chai').assert;
const fs = require('fs-extra');
const generator = require('../');

describe('API generation', function() {
  const dest = 'test/playground';
  const srcDir = 'test/';

  describe('RAML 1.0 data model generation', function() {
    let files;
    let opts;

    const modelFile = dest + '/raml1.json';
    const compactModelFile = dest + '/raml1-compact.json';

    beforeEach(function() {
      files = new Map();
      files.set('apis/raml1.raml', 'RAML 1.0');
      opts = {
        src: srcDir,
        dest
      };
    });

    afterEach(function() {
      return fs.remove(dest);
    });

    it('Generates data model for regular model', () => {
      return generator(files, opts)
      .then(() => fs.pathExists(modelFile))
      .then((exists) => assert.isTrue(exists))
      .then(() => fs.readJson(modelFile))
      .then((data) => {
        assert.typeOf(data, 'array');
      });
    });

    it('Generates data model for compact model', () => {
      return generator(files, opts)
      .then(() => fs.pathExists(compactModelFile))
      .then((exists) => assert.isTrue(exists))
      .then(() => fs.readJson(compactModelFile))
      .then((data) => {
        assert.typeOf(data, 'array');
      });
    });
  });

  describe('RAML 0.8 data model generation', function() {
    let files;
    let opts;

    const modelFile = dest + '/raml08.json';
    const compactModelFile = dest + '/raml08-compact.json';

    beforeEach(function() {
      files = new Map();
      files.set('apis/raml08.raml', 'RAML 0.8');
      opts = {
        src: srcDir,
        dest
      };
    });

    afterEach(function() {
      return fs.remove(dest);
    });

    it('Generates data model for regular model', () => {
      return generator(files, opts)
      .then(() => fs.pathExists(modelFile))
      .then((exists) => assert.isTrue(exists))
      .then(() => fs.readJson(modelFile))
      .then((data) => {
        assert.typeOf(data, 'array');
      });
    });

    it('Generates data model for compact model', () => {
      return generator(files, opts)
      .then(() => fs.pathExists(compactModelFile))
      .then((exists) => assert.isTrue(exists))
      .then(() => fs.readJson(compactModelFile))
      .then((data) => {
        assert.typeOf(data, 'array');
      });
    });
  });
});
