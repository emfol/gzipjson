const os = require('os');
const fs = require('fs');
const path = require('path');
const util = require('util');
const log4js = require('log4js');
const gzipjson = require('../index.js');

log4js.configure(require('./log4js.json'))

const unlink = util.promisify(fs.unlink);
const writeFile = util.promisify(fs.writeFile);
const readFile = util.promisify(fs.readFile);

const example = Object.freeze({ a: 'aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa' });

describe('GzipJson', () => {
    it('should compress a JSON-serializable data', async () => {
        const buffer = await gzipjson(example);
        expect(buffer.toString('base64')).toBe('H4sIAAAAAAAAA6vmUlBQSlSyAhIEgBJXLQDriw8sLQAAAA==');
    });

    it('should compress and write a JSON-serializable data to a file', async () => {
        const filepath = path.join(os.tmpdir(), 'gzipjzon-example.json.gz');
        await gzipjson(example, filepath);
        const buffer = await readFile(filepath);
        expect(buffer.toString('base64')).toBe('H4sIAAAAAAAAA6vmUlBQSlSyAhIEgBJXLQDriw8sLQAAAA==');
        await unlink(filepath);
    });

    it('should compress compress but not store buffer on bad file paths', async () => {
        const filepath = path.join(os.tmpdir(), 'gzipjzon-empty.json.gz');
        await writeFile(filepath, Buffer.alloc(0));
        const buffer = await gzipjson(example, filepath);
        expect(buffer.toString('base64')).toBe('H4sIAAAAAAAAA6vmUlBQSlSyAhIEgBJXLQDriw8sLQAAAA==');
        const read = await readFile(filepath)
        expect(read.length).toBe(0);
        await unlink(filepath);
    });

    it('should return null when given invalid data', async () => {
        const buffer = await gzipjson(undefined);
        expect(buffer).toBe(null);
    });
});
