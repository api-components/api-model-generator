const amf = require('amf-client-js');
const fs = require('fs-extra');
const path = require('path');

amf.plugins.document.WebApi.register();
amf.plugins.document.Vocabularies.register();
amf.plugins.features.AMFValidation.register();

/**
 * Generates json/ld file from parsed document.
 *
 * @param {Object} doc
 * @param {String} file
 * @param {String} type
 * @param {String} destPath
 * @param {String} resolution
 * @return {Promise}
 */
async function processFile(doc, file, type, destPath, resolution) {
  let validateProfile;
  switch (type) {
    case 'RAML 1.0': validateProfile = amf.ProfileNames.RAML; break;
    case 'RAML 0.8': validateProfile = amf.ProfileNames.RAML08; break;
    case 'OAS 2.0':
    case 'OAS 3.0':
      validateProfile = amf.ProfileNames.OAS;
      break;
  }
  let dest = file.substr(0, file.lastIndexOf('.')) + '.json';
  if (dest.indexOf('/') !== -1) {
    dest = dest.substr(dest.lastIndexOf('/'));
  }

  const generator = amf.Core.generator('AMF Graph', 'application/ld+json');
  const vResult = await amf.AMF.validate(doc, validateProfile);
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
  }
  if (resolver) {
    doc = resolver.resolve(doc, resolution);
  }
  const fullFile = path.join(destPath, dest);
  const compactDest = dest.replace('.json', '-compact.json');
  const compactFile = path.join(destPath, compactDest);

  const fullOpts = amf.render.RenderOptions().withSourceMaps;
  const fullData = await generator.generateString(doc, fullOpts);
  await fs.ensureFile(fullFile);
  await fs.writeFile(fullFile, fullData, 'utf8');

  const compactOpts = amf.render.RenderOptions().withSourceMaps.withCompactUris;
  // withRawSourceMaps.
  const compactData = await generator.generateString(doc, compactOpts);
  await fs.ensureFile(compactFile);
  await fs.writeFile(compactFile, compactData, 'utf8');
}

/**
 * Normalizes input options to a common structure.
 * @param {String|Array|Object} input User input
 * @return {Object} A resulting configuration options with:
 * - required `type`
 * - optional `mime`
 * - optional `resolution`
 */
function normalizeOptions(input) {
  if (Array.isArray(input)) {
    const [type, mime, resolution] = input;
    return { type, mime, resolution };
  }
  if (typeof input === 'object') {
    return input;
  }
  return {
    type: input,
  }
}

/**
 * Parses file and sends it to process.
 *
 * @param {String} file File name in `demo` folder
 * @param {String|Array<String>} input Source file type or an array where
 * first element is API spec format and second is API file media type
 * @param {Object} opts
 * - `src` String, default to 'demo/'
 * - `dest` String, default to 'demo/'
 * @return {String}
 */
async function parseFile(file, input, opts) {
  let srcDir = opts.src || 'demo/';
  if (srcDir[srcDir.length - 1] !== '/') {
    srcDir += '/';
  }
  let dest = opts.dest || 'demo/';
  if (dest[dest.length - 1] !== '/') {
    dest += '/';
  }
  const { type, mime='application/yaml', resolution='editing' } = normalizeOptions(input);
  const parser = amf.Core.parser(type, mime);
  const doc = await parser.parseFileAsync(`file://${srcDir}${file}`);
  return processFile(doc, file, type, dest, resolution);
}
/**
 * Reads `file` as JSON and creates a Map with definitions from the file.
 * The keys are paths to the API file relative to `opts.src` and values is
 * API type.
 * @param {String} file Path to a file definition.
 * @return {Array} First item is the files map and second build configuration if any.
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
  return [files, opts];
}

module.exports = async function(files, opts={}) {
  if (typeof files === 'string') {
    const [cnfFiles, cnfOpts] = prepareFile(files);
    files = cnfFiles;
    opts = Object.assign(cnfOpts, opts);
  }
  await amf.Core.init();
  for (const [file, type] of files) {
    await parseFile(file, type, opts);
  }
};
