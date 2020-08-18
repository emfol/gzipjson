const log4js = require('log4js');
const gzipjson = require('../index.js');

log4js.configure(require('./log4js.json'));

async function main() {
    await gzipjson({ message: 'Life is about creating yourself.' }, './message.json.gz');
}

main();
