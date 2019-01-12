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
 * @return {Promise}
 */
function processFile(doc, file, type, destPath) {
  let validateProfile;
  switch (type) {
    case 'RAML 1.0': validateProfile = amf.ProfileNames.RAML; break;
    case 'RAML 0.8': validateProfile = amf.ProfileNames.RAML08; break;
    case 'OAS 1.0':
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
  return amf.AMF.validate(doc, validateProfile)
  .then((result) => {
    if (!result.conforms) {
      console.log(result.toString());
    }
  })
  .then(() => {
    const r = amf.Core.resolver('RAML 1.0');
    doc = r.resolve(doc, 'editing');
    return generator.generateString(doc);
  })
  .then((data) => {
    const file = path.join(destPath, dest);
    return fs.ensureFile(file)
    .then(() => fs.writeFileSync(file, data, 'utf8'));
  })
  .then(() => {
    const opts = amf.render.RenderOptions().withSourceMaps.withCompactUris;
    // withRawSourceMaps.
    return generator.generateString(doc, opts);
  })
  .then((data) => {
    const compactDest = dest.replace('.json', '-compact.json');
    const file = path.join(destPath, compactDest);
    fs.writeFileSync(file, data, 'utf8');
  });
}
/**
 * Parses file and sends it to process.
 *
 * @param {String} file File name in `demo` folder
 * @param {String|Array<String>} type Source file type or an array where
 * first element is API spec format and second is API file media type
 * @param {Object} opts
 * - `src` String, default to 'demo/'
 * - `dest` String, default to 'demo/'
 * @return {String}
 */
function parseFile(file, type, opts) {
  let srcDir = opts.src || 'demo/';
  if (srcDir[srcDir.length - 1] !== '/') {
    srcDir += '/';
  }
  let dest = opts.dest || 'demo/';
  if (dest[dest.length - 1] !== '/') {
    dest += '/';
  }
  let mediaType;
  if (type instanceof Array) {
    mediaType = type[1];
    type = type[0];
  }
  if (!mediaType) {
    mediaType = 'application/yaml';
  }
  const parser = amf.Core.parser(type, mediaType);
  return parser.parseFileAsync(`file://${srcDir}${file}`)
  .then((doc) => processFile(doc, file, type, dest));
}
/**
 * Reads `file` as JSON and creates a Map with definitions from the file.
 * The keys are paths to the API file relative to `opts.src` and values is
 * API type.
 * @param {String} file Path to a file definition.
 * @return {Map}
 */
function prepareFile(file) {
  file = path.resolve(process.cwd(), file);
  const data = require(file);
  const files = new Map();
  Object.keys(data).forEach((key) => {
    files.set(key, data[key]);
  });
  return files;
}

module.exports = function(files, opts) {
  if (!opts) {
    opts = {};
  }
  if (typeof files === 'string') {
    files = prepareFile(files);
  }
  return amf.Core.init().then(() => {
    const promises = [];
    for (const [file, type] of files) {
      promises.push(parseFile(file, type, opts));
    }

    return Promise.all(promises);
  });
};
