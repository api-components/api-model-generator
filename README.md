# api-model-generator

AMF model generator for API components used for tests and demo pages.

## Usage

```
$ npm i --saved-dev @api-components/api-model-generator
```

In a project

```javascript
const generator = require('@api-components/api-model-generator');

const files = new Map();
files.set('demo-api/demo-api.raml', 'RAML 1.0');
files.set('api entry point file', 'API type');

generator(files, {
  src: 'demo/' // default
  dest: 'demo/' // default
})
.then(() => console.log('Finito'));
```
