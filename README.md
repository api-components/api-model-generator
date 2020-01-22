# api-model-generator

AMF model generator for API components used for tests and demo pages.

## Usage

```
$ npm i --saved-dev @api-components/api-model-generator
```

In a project define `models.json` in either `demo/` or `tes/` folders.
In the JSON file place model description where keys are paths to the
API main file (relative to `opts.src` option) and value is the API spec format.
If the value is an array then first element must be API format and second is API media type.

### Data structure

`ApisList` ⇒ `Object`

`ApisList.src` ⇒ `String` - source path to the APIs. Default to `demo/`.
`ApisList.dest` ⇒ `String` - path where output generated models. Default to `demo/`.
`ApisList.<path>` ⇒ `String`, `Array`, `ApiDefinition` - a definition of an API to process. Key is a path to the API main file. The value depending on a type has different meaning.

`String` value represents API type. Can be `RAML 0.8`, `RAML 1.0`, `OAS 2.0`, or `OAS 3.0`. It generates api model for `application/yaml` media type and for the `editing` resolution pipeline.

`Array` value is deprecated. Please don't use it.

`ApiDefinition` ⇒ `Object`
`ApiDefinition.type` ⇒ `String`. API type to process. Can be `RAML 0.8`, `RAML 1.0`, `OAS 2.0`, or `OAS 3.0`.
`ApiDefinition.mime` ⇒ `String`. API media type. Default to `application/yaml`.
`ApiDefinition.resolution` ⇒ `String`. AMF resolution pipeline. Default to `editing` which is the original resolution pipeline for API Console. Future releases of AMF can support different options.


### Example apis.json

```json
{
  "api-1/api.raml": "RAML 1.0",
  "oas2/oas2.json": {
    "type": "OAS 2.0",
    "mime": "application/json"
  },
  "api/api.raml": {
    "type": "RAML 1.0",
    "mime": "application/raml",
    "resolution": "editing"
  }
}
```

then pass the location of the file to the library:

```javascript
const generator = require('@api-components/api-model-generator');
await generator('./demo/models.json');
```

When using this format the element will be included in automated tests when AMF version change.


Alternatively it is possible to pass the map of files to the library:

```javascript
const generator = require('@api-components/api-model-generator');

const files = new Map();
files.set('demo-api/demo-api.raml', 'RAML 1.0');
files.set('oas2/oas2.json', ["OAS 2.0", "application/json"]);

generator(files, {
  src: 'demo/' // default
  dest: 'demo/' // default
})
.then(() => console.log('Finito'));
```
