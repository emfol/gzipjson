# gzipjson

Very simple utility for storing GZIP-compressed JSON into files... (as silent as possible)

## Installation

```bash
npm install --save gzipjson
```

## Usage / Example

```javascript
const gzipjson = require('gzipjson');

async function main() {
    await gzipjson({ message: 'Life is about creating yourself.' }, './message.json.gz');
}

main();
```
