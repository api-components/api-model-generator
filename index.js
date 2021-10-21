/* eslint-disable no-console */
const amf = require('amf-client-js');
const fs = require('fs-extra');
const path = require('path');

amf.plugins.document.WebApi.register();
amf.plugins.document.Vocabularies.register();
amf.plugins.features.AMFValidation.register();

/** @typedef {import('./types').ApiConfiguration} ApiConfiguration */
/** @typedef {import('./types').FilePrepareResult} FilePrepareResult */
/** @typedef {import('./types').ApiGenerationOptions} ApiGenerationOptions */
/** @typedef {import('./types').ApiType} ApiType */

/**
 * Generates json/ld file from parsed document.
 *
 * @param {amf.model.document.BaseUnit} doc
 * @param {string} file
 * @param {string} type
 * @param {string} destPath
 * @param {string} resolution
 * @param {boolean} flattened
 * @return {Promise<void>}
 */
async function processFile(doc, file, type, destPath, resolution, flattened) {
  let validateProfile;
  switch (type) {
    case 'RAML 1.0': validateProfile = amf.ProfileNames.RAML; break;
    case 'RAML 0.8': validateProfile = amf.ProfileNames.RAML08; break;
    case 'OAS 2.0':
    case 'OAS 3.0':
      validateProfile = amf.ProfileNames.OAS;
      break;
    case 'ASYNC 2.0':
      // @ts-ignore
      validateProfile = amf.ProfileNames.ASYNC20;
      break;
  }
  let dest = `${file.substr(0, file.lastIndexOf('.')) }.json`;
  if (dest.indexOf('/') !== -1) {
    dest = dest.substr(dest.lastIndexOf('/'));
  }

  const generator = amf.Core.generator('AMF Graph', 'application/ld+json');
  const vResult = await amf.AMF.validate(doc, validateProfile, undefined);
  if (!vResult.conforms) {
    /* eslint-disable-next-line no-console */
    console.log(vResult.toString());
  }
  let resolver;
  switch (type) {
    case 'RAML 1.0': resolver = amf.Core.resolver('RAML 1.0'); break;
    case 'RAML 0.8': resolver = amf.Core.resolver('RAML 0.8'); break;
    case 'OAS 2.0': resolver = amf.Core.resolver('OAS 2.0'); break;
    case 'OAS 3.0': resolver = amf.Core.resolver('OAS 3.0'); break;
    case 'ASYNC 2.0': resolver = amf.Core.resolver('ASYNC 2.0'); break;
  }
  if (resolver) {
    doc = resolver.resolve(doc, resolution);
  }
  const fullFile = path.join(destPath, dest);
  const compactDest = dest.replace('.json', '-compact.json');
  const compactFile = path.join(destPath, compactDest);

  // @ts-ignore
  let fullOpts = amf.render.RenderOptions().withSourceMaps;
  if (flattened) {
    fullOpts = fullOpts.withFlattenedJsonLd;
  }
  const fullData = await generator.generateString(doc, fullOpts);
  await fs.ensureFile(fullFile);
  await fs.writeFile(fullFile, fullData, 'utf8');

  // @ts-ignore
  let compactOpts = amf.render.RenderOptions().withSourceMaps.withCompactUris;
  if (flattened) {
    compactOpts = compactOpts.withFlattenedJsonLd;
  }
  // withRawSourceMaps.
  const compactData = await generator.generateString(doc, compactOpts);
  await fs.ensureFile(compactFile);
  await fs.writeFile(compactFile, compactData, 'utf8');
}

/**
 * Normalizes input options to a common structure.
 * @param {ApiConfiguration|string|string[]} input User input
 * @return {ApiConfiguration} A resulting configuration options with
 */
function normalizeOptions(input) {
  if (Array.isArray(input)) {
    const [type, mime, resolution, flattened] = input;
    // @ts-ignore
    return { type, mime, resolution, flattened };
  }
  if (typeof input === 'object') {
    return input;
  }
  return {
    type: /** @type ApiType */ (input),
  };
}

/**
 * Parses file and sends it to process.
 *
 * @param {string} file File name in `demo` folder
 * @param {ApiConfiguration|string|string[]} cnf
 * @param {ApiGenerationOptions} opts Processing options
 * @return {Promise<void>}
 */
async function parseFile(file, cnf, opts) {
  let { src='demo/', dest='demo/' } = opts;
  if (!src.endsWith('/')) {
    src += '/';
  }
  if (!dest.endsWith('/')) {
    dest += '/';
  }
  const { type, mime='application/yaml', resolution='editing', flattened = false } = normalizeOptions(cnf);
  const parser = amf.Core.parser(type, mime);
  const doc = await parser.parseFileAsync(`file://${src}${file}`);
  return processFile(doc, file, type, dest, resolution, flattened);
}

/**
 * Reads `file` as JSON and creates a Map with definitions from the file.
 * The keys are paths to the API file relative to `opts.src` and values is
 * API type.
 * @param {string} file Path to a file definition.
 * @return {FilePrepareResult} The key is the api file location in the `opts.src`
 * directory. The value is the build configuration.
 */
function prepareFile(file) {
  file = path.resolve(process.cwd(), file);
  const data = require(file);
  const files = new Map();
  const opts = {};
  Object.keys(data).forEach((key) => {
    switch (key) {
      case 'src':
      case 'dest':
        opts[key] = data[key];
        break;
      default:
        files.set(key, data[key]);
        break;
    }
  });
  return {
    files,
    opts,
  };
}

/**
 * @param {string|Map<string, ApiConfiguration|string|string[]>} init If string then this is a location of
 * the file that holds processing configuration. Otherwise it is already prepared configuration.
 * @param {ApiGenerationOptions=} opts Processing options.
 * @return {Promise<void>}
 */
async function main(init, opts={}) {
  if (typeof init === 'string') {
    const { files: cnfFiles, opts: cnfOpts } = prepareFile(init);
    init = cnfFiles;
    opts = { ...cnfOpts, ...opts };
  }
  await amf.Core.init();
  for (const [file, type] of init) {
    await parseFile(file, type, opts);
  }
}

/**
 * Runs the default function and exists the process when failed.
 * @param {Map<string, ApiConfiguration>} init The list of files to parse with their configuration.
 * @param {ApiGenerationOptions=} opts Optional parsing options.
 */
async function generate(init, opts) {
  try {
    console.log(`Generating graph models for ${init.size} api(s).`);
    await main(init, opts);
    console.log('Models created');
  } catch (cause) {
    console.error(cause);
    throw new Error('Unable to process APIs.');
  }
}

const myModule = module.exports = main;
myModule.generate = generate;
