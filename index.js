/* eslint-disable no-console */
const amf = require('amf-client-js');
const fs = require('fs-extra');
const path = require('path');

const {
  RAMLConfiguration,
  OASConfiguration,
  AsyncAPIConfiguration,
  GRPCConfiguration,
  RenderOptions,
  PipelineId,
} = amf;

/** @typedef {import('./types').ApiConfiguration} ApiConfiguration */
/** @typedef {import('./types').FilePrepareResult} FilePrepareResult */
/** @typedef {import('./types').ApiGenerationOptions} ApiGenerationOptions */
/** @typedef {import('./types').ApiType} ApiType */

/**
 * @param {string} type
 * @returns {any}
 */
function getConfiguration(type) {
  switch (type) {
    case 'RAML 0.8': return RAMLConfiguration.RAML08();
    case 'RAML 1.0': return RAMLConfiguration.RAML10();
    case 'OAS 2.0':
    case 'OAS 2':
      return OASConfiguration.OAS20();
    case 'OAS 3.0':
    case 'OAS 3':
      return OASConfiguration.OAS30();
    case 'ASYNC 2.0': return AsyncAPIConfiguration.Async20();
    case 'GRPC': return GRPCConfiguration.GRPC();
    default: throw new Error(`Unknown API type: ${type}`);
  }
}

/**
 * Generates json/ld file from parsed document using AMF v5 API.
 *
 * @param {string} sourceFile
 * @param {string} file
 * @param {string} type
 * @param {string} destPath
 * @param {string} resolution
 * @param {boolean} flattened
 * @return {Promise<void>}
 */
async function processFile(sourceFile, file, type, destPath, resolution, flattened) {
  let dest = `${file.substr(0, file.lastIndexOf('.')) }.json`;
  if (dest.indexOf('/') !== -1) {
    dest = dest.substr(dest.lastIndexOf('/'));
  }

  // Setup render options
  let renderOpts = new RenderOptions().withSourceMaps().withCompactUris();
  if (flattened) {
    renderOpts = renderOpts.withCompactedEmission();
  }

  // Get configuration for API type
  const apiConfiguration = getConfiguration(type).withRenderOptions(renderOpts);
  const client = apiConfiguration.baseUnitClient();

  // Parse the file
  const parseResult = await client.parse(sourceFile);

  if (!parseResult.conforms) {
    /* eslint-disable-next-line no-console */
    console.log('Validation warnings/errors:');
    console.log(parseResult.toString());
  }

  // Transform using resolution pipeline
  const pipelineId = resolution === 'editing' ? PipelineId.Editing : PipelineId.Default;
  const transformed = client.transform(parseResult.baseUnit, pipelineId);

  // Render to JSON-LD
  const fullFile = path.join(destPath, dest);
  const compactDest = dest.replace('.json', '-compact.json');
  const compactFile = path.join(destPath, compactDest);

  // Generate full model (same as compact in v5 with withCompactUris)
  const modelData = await client.render(transformed.baseUnit, 'application/ld+json');

  await fs.ensureFile(fullFile);
  await fs.writeFile(fullFile, modelData, 'utf8');

  await fs.ensureFile(compactFile);
  await fs.writeFile(compactFile, modelData, 'utf8');
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
  const sourceFile = `file://${src}${file}`;
  return processFile(sourceFile, file, type, dest, resolution, flattened);
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
  // AMF v5 doesn't require explicit initialization
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
