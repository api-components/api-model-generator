const assert = require('chai').assert;
const fs = require('fs-extra');
const path = require('path');
const generator = require('../');

describe('API generation', function() {
  const dest = path.join('test', 'playground');
  const srcDir = 'test/';

  describe('RAML 1.0 data model generation', function() {
    let files;
    let opts;

    const modelFile = path.join(dest, 'raml1.json');
    const compactModelFile = path.join(dest, 'raml1-compact.json');

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
    const modelFile = path.join(dest, 'raml08.json');
    const compactModelFile = path.join(dest, 'raml08-compact.json');

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

  describe('Api list config file', function() {
    let opts;
    const modelFile = path.join(dest, 'raml1.json');
    const compactModelFile = path.join(dest, 'raml1-compact.json');
    const configFile = path.join('test', 'apis.json');
    beforeEach(function() {
      opts = {
        src: srcDir,
        dest
      };
    });

    afterEach(function() {
      return fs.remove(dest);
    });

    it('Generates data model for regular model', () => {
      return generator(configFile, opts)
      .then(() => fs.pathExists(modelFile))
      .then((exists) => assert.isTrue(exists))
      .then(() => fs.readJson(modelFile))
      .then((data) => {
        assert.typeOf(data, 'array');
      });
    });

    it('Generates data model for compact model', () => {
      return generator(configFile, opts)
      .then(() => fs.pathExists(compactModelFile))
      .then((exists) => assert.isTrue(exists))
      .then(() => fs.readJson(compactModelFile))
      .then((data) => {
        assert.typeOf(data, 'array');
      });
    });
  });

  describe('Api list config file with options', function() {
    const modelFile = path.join(dest, 'raml1.json');
    const compactModelFile = path.join(dest, 'raml1-compact.json');
    const configFile = path.join('test', 'apis-options.json');

    afterEach(function() {
      return fs.remove(dest);
    });

    it('Generates data model for regular model', () => {
      return generator(configFile)
      .then(() => fs.pathExists(modelFile))
      .then((exists) => assert.isTrue(exists))
      .then(() => fs.readJson(modelFile))
      .then((data) => {
        assert.typeOf(data, 'array');
      });
    });

    it('Generates data model for compact model', () => {
      return generator(configFile)
      .then(() => fs.pathExists(compactModelFile))
      .then((exists) => assert.isTrue(exists))
      .then(() => fs.readJson(compactModelFile))
      .then((data) => {
        assert.typeOf(data, 'array');
      });
    });
  });

  describe('Function call options overrides file options', function() {
    const alteredDest = path.join(dest, 'altered');
    const modelFile = path.join(alteredDest, 'raml1.json');
    const compactModelFile = path.join(alteredDest, 'raml1-compact.json');
    const configFile = path.join('test', 'apis-options.json');

    afterEach(function() {
      return fs.remove(dest);
    });

    it('Generates data model for regular model', () => {
      return generator(configFile, {
        dest: alteredDest
      })
      .then(() => fs.pathExists(modelFile))
      .then((exists) => assert.isTrue(exists))
      .then(() => fs.readJson(modelFile))
      .then((data) => {
        assert.typeOf(data, 'array');
        const context = data[0]['@context'];
        assert.isUndefined(context);
      });
    });

    it('Generates data model for compact model', () => {
      return generator(configFile, {
        dest: alteredDest
      })
      .then(() => fs.pathExists(compactModelFile))
      .then((exists) => assert.isTrue(exists))
      .then(() => fs.readJson(compactModelFile))
      .then((data) => {
        assert.typeOf(data, 'array');
        const context = data[0]['@context'];
        assert.typeOf(context, 'object');
      });
    });
  });
});
