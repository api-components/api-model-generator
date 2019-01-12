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

demo/models.json file:

```json
{
  "demo-api/demo-api.raml": ["RAML 1.0", "application/raml"],
  "exchange-experience-api/exchange-experience-api.raml": "RAML 0.8",
  "oas2/oas2.json": ["OAS 2.0", "application/json"],
  "oas2/oas2.yaml": "OAS 2.0"
}
```

then pass the location of the file to the library:

```javascript
const generator = require('@api-components/api-model-generator');
generator('./demo/models.json')
.then(() => console.log('Models created'))
.catch((cause) => console.error(cause));
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
