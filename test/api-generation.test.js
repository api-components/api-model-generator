/* eslint-disable import/no-commonjs */
const { assert } = require('chai');
const fs = require('fs-extra');
const path = require('path');
const generator = require('../');

describe('API generation', () => {
  const dest = path.join('test', 'playground');
  const srcDir = 'test/';

  describe('RAML 1.0 data model generation', () => {
    let files;
    let opts;

    const modelFile = path.join(dest, 'raml1.json');
    const compactModelFile = path.join(dest, 'raml1-compact.json');

    beforeEach(() => {
      files = new Map();
      opts = {
        src: srcDir,
        dest,
      };
    });

    afterEach(() => fs.remove(dest));

    it('Generates data model for regular model', async () => {
      files.set('apis/raml1.raml', 'RAML 1.0');
      await generator(files, opts);
      const exists = await fs.pathExists(modelFile);
      assert.isTrue(exists, 'model file exists');
      const data = await fs.readJson(modelFile);
      assert.typeOf(data, 'array');
    });

    it('Generates data model for compact model', async () => {
      files.set('apis/raml1.raml', 'RAML 1.0');
      await generator(files, opts);
      const exists = await fs.pathExists(compactModelFile);
      assert.isTrue(exists, 'model file exists');
      const data = await fs.readJson(compactModelFile);
      assert.typeOf(data, 'array');
    });

    it('generates model with options (Object)', async () => {
      files.set('apis/raml1.raml', {
        type: 'RAML 1.0',
        mime: 'application/raml',
        resolution: 'editing',
      });
      await generator(files, opts);
      const exists = await fs.pathExists(compactModelFile);
      assert.isTrue(exists, 'model file exists');
      const data = await fs.readJson(compactModelFile);
      assert.typeOf(data, 'array');
    });

    it('uses default values (Object)', async () => {
      files.set('apis/raml1.raml', {
        type: 'RAML 1.0',
      });
      await generator(files, opts);
      const exists = await fs.pathExists(compactModelFile);
      assert.isTrue(exists, 'model file exists');
      const data = await fs.readJson(compactModelFile);
      assert.typeOf(data, 'array');
    });

    it('generates model with options (Array)', async () => {
      files.set('apis/raml1.raml', ['RAML 1.0', 'application/raml', 'editing']);
      await generator(files, opts);
      const exists = await fs.pathExists(compactModelFile);
      assert.isTrue(exists, 'model file exists');
      const data = await fs.readJson(compactModelFile);
      assert.typeOf(data, 'array');
    });

    it('uses default values (Array)', async () => {
      files.set('apis/raml1.raml', ['RAML 1.0']);
      await generator(files, opts);
      const exists = await fs.pathExists(compactModelFile);
      assert.isTrue(exists, 'model file exists');
      const data = await fs.readJson(compactModelFile);
      assert.typeOf(data, 'array');
    });
  });

  describe('RAML 0.8 data model generation', () => {
    let files;
    let opts;
    const modelFile = path.join(dest, 'raml08.json');
    const compactModelFile = path.join(dest, 'raml08-compact.json');

    beforeEach(() => {
      files = new Map();
      files.set('apis/raml08.raml', 'RAML 0.8');
      opts = {
        src: srcDir,
        dest,
      };
    });

    afterEach(() => fs.remove(dest));

    it('Generates data model for regular model', () => generator(files, opts)
    .then(() => fs.pathExists(modelFile))
    .then((exists) => assert.isTrue(exists))
    .then(() => fs.readJson(modelFile))
    .then((data) => {
      assert.typeOf(data, 'array');
    }));

    it('Generates data model for compact model', () => generator(files, opts)
    .then(() => fs.pathExists(compactModelFile))
    .then((exists) => assert.isTrue(exists))
    .then(() => fs.readJson(compactModelFile))
    .then((data) => {
      assert.typeOf(data, 'array');
    }));
  });

  describe('Api list config file', () => {
    let opts;
    const modelFile = path.join(dest, 'raml1.json');
    const compactModelFile = path.join(dest, 'raml1-compact.json');
    const configFile = path.join('test', 'apis.json');
    beforeEach(() => {
      opts = {
        src: srcDir,
        dest,
      };
    });

    afterEach(() => fs.remove(dest));

    it('Generates data model for regular model', () => generator(configFile, opts)
    .then(() => fs.pathExists(modelFile))
    .then((exists) => assert.isTrue(exists))
    .then(() => fs.readJson(modelFile))
    .then((data) => {
      assert.typeOf(data, 'array');
    }));

    it('Generates data model for compact model', () => generator(configFile, opts)
    .then(() => fs.pathExists(compactModelFile))
    .then((exists) => assert.isTrue(exists))
    .then(() => fs.readJson(compactModelFile))
    .then((data) => {
      assert.typeOf(data, 'array');
    }));
  });

  describe('Api list config file with options', () => {
    const modelFile = path.join(dest, 'raml1.json');
    const compactModelFile = path.join(dest, 'raml1-compact.json');
    const configFile = path.join('test', 'apis-options.json');

    afterEach(() => fs.remove(dest));

    it('Generates data model for regular model', () => generator(configFile)
    .then(() => fs.pathExists(modelFile))
    .then((exists) => assert.isTrue(exists))
    .then(() => fs.readJson(modelFile))
    .then((data) => {
      assert.typeOf(data, 'array');
    }));

    it('Generates data model for compact model', () => generator(configFile)
    .then(() => fs.pathExists(compactModelFile))
    .then((exists) => assert.isTrue(exists))
    .then(() => fs.readJson(compactModelFile))
    .then((data) => {
      assert.typeOf(data, 'array');
    }));
  });

  describe('Function call options overrides file options', () => {
    const alteredDest = path.join(dest, 'altered');
    const modelFile = path.join(alteredDest, 'raml1.json');
    const compactModelFile = path.join(alteredDest, 'raml1-compact.json');
    const configFile = path.join('test', 'apis-options.json');

    afterEach(() => fs.remove(dest));

    it('Generates data model for regular model', () => generator(configFile, {
      dest: alteredDest,
    })
    .then(() => fs.pathExists(modelFile))
    .then((exists) => assert.isTrue(exists))
    .then(() => fs.readJson(modelFile))
    .then((data) => {
      assert.typeOf(data, 'array');
      const ctx = data[0]['@context'];
      assert.isUndefined(ctx);
    }));

    it('Generates data model for compact model', () => generator(configFile, {
      dest: alteredDest,
    })
    .then(() => fs.pathExists(compactModelFile))
    .then((exists) => assert.isTrue(exists))
    .then(() => fs.readJson(compactModelFile))
    .then((data) => {
      assert.typeOf(data, 'array');
      const ctx = data[0]['@context'];
      assert.typeOf(ctx, 'object');
    }));
  });

  describe('AsyncAPI 2.0 data model generation', () => {
    let files;
    let opts;

    const modelFile = path.join(dest, 'asyncApi20.json');
    const compactModelFile = path.join(dest, 'asyncApi20-compact.json');

    beforeEach(() => {
      files = new Map();
      opts = {
        src: srcDir,
        dest,
      };
    });

    afterEach(() => fs.remove(dest));

    it('Generates data model for regular model', async () => {
      files.set('apis/asyncApi20.yaml', { 'type': 'ASYNC 2.0', 'mime': 'application/yaml' });
      await generator(files, opts);
      const exists = await fs.pathExists(modelFile);
      assert.isTrue(exists, 'model file exists');
      const data = await fs.readJson(modelFile);
      assert.typeOf(data, 'array');
    });

    it('Generates data model for compact model', async () => {
      files.set('apis/asyncApi20.yaml', { 'type': 'ASYNC 2.0', 'mime': 'application/yaml' });
      await generator(files, opts);
      const exists = await fs.pathExists(compactModelFile);
      assert.isTrue(exists, 'model file exists');
      const data = await fs.readJson(compactModelFile);
      assert.typeOf(data, 'array');
    });
  });
});
