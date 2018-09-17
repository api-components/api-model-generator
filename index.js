const amf = require('amf-client-js');
const fs = require('fs');
// const jsonld = require('jsonld');

amf.plugins.document.WebApi.register();
amf.plugins.document.Vocabularies.register();
amf.plugins.features.AMFValidation.register();

// const ldContext = {
//   'raml-http': 'http://a.ml/vocabularies/http#',
//   'shacl': 'http://www.w3.org/ns/shacl#',
//   'raml-shapes': 'http://a.ml/vocabularies/shapes#',
//   'security': 'http://a.ml/vocabularies/security#',
//   'rdfs': 'http://www.w3.org/2000/01/rdf-schema#',
//   'data': 'http://a.ml/vocabularies/data#',
//   'doc': 'http://a.ml/vocabularies/document#',
//   'schema-org': 'http://schema.org/',
//   'xsd': 'http://www.w3.org/2001/XMLSchema#',
//   'hydra': 'http://www.w3.org/ns/hydra/core#'
// };

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
    console.log(result.toString());
  })
  .then(() => {
    const r = amf.Core.resolver('RAML 1.0');
    doc = r.resolve(doc, 'editing');
    return generator.generateString(doc);
  })
  // .then((data) => {
  //   fs.writeFileSync(destPath + dest, data, 'utf8');
  //   return new Promise((resolve) => {
  //     jsonld.compact(JSON.parse(data), ldContext, (err, compacted) => {
  //       if (err) {
  //         console.error(err);
  //       } else {
  //         const f = destPath + dest.replace('.json', '-compact.json');
  //         fs.writeFileSync(f, JSON.stringify(compacted, null, 2), 'utf8');
  //       }
  //       resolve();
  //     });
  //   });
  // });
  .then((data) => {
    fs.writeFileSync(destPath + dest, data, 'utf8');
    const opts = amf.render.RenderOptions().withSourceMaps.withCompactUris;
    // withRawSourceMaps.
    return generator.generateString(doc, opts);
  })
  .then((data) => {
    const f = destPath + dest.replace('.json', '-compact.json');
    fs.writeFileSync(f, data, 'utf8');
  });
}
/**
 * Parses file and sends it to process.
 *
 * @param {String} file File name in `demo` folder
 * @param {String} type Source file type
 * @param {Object} opts
 * - `srcDir` String
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
  const parser = amf.Core.parser(type, 'application/yaml');
  return parser.parseFileAsync(`file://${srcDir}${file}`)
  .then((doc) => processFile(doc, file, type, dest));
}

module.exports = function(files, opts) {
  if (!opts) {
    opts = {};
  }
  return amf.Core.init().then(() => {
    const promises = [];
    for (const [file, type] of files) {
      promises.push(parseFile(file, type, opts));
    }

    return Promise.all(promises);
  });
};
