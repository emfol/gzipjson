const fs = require('fs');
const zlib = require('zlib');
const log4js = require('@log4js-node/log4js-api');

/*
 * Locals
 */

const logger = log4js.getLogger('gzipjson');

/**
 * Compress a given JSON data into a GZIP-compressed buffer optionally storing the resulting buffer into a file.
 * The buffer is only written to disk if a valid path is provided in the second parameter.
 *
 * @param {Object|Array} data Data to be encoded into JSON, compressed and optionally written to disk.
 * @param {String} filepath Optional. The path to the file where data should be stored.
 */

async function gzipjson(data, filepath) {
    try {
        const uncompressed = dataToJsonBuffer(data);
        const compressed = await gzip(uncompressed);
        const written = typeof filepath === 'string' ? await attemptBufferStorage(filepath, compressed) : 0;
        print(uncompressed.length, compressed.length, written, filepath)
        return compressed;
    } catch (error) {
        logger.debug('Oops! %s', error.message);
    }
    return null;
}

/*
 * Helpers
 */

function print(uncompressed, compressed, written, path) {
    const message = 'Compression in bytes: %d -> %d'
    if (written > 0) {
        logger.debug(message + ' (%d written to "%s")', uncompressed, compressed, written, path);
    } else {
        logger.debug(message, uncompressed, compressed);
    }
}

async function gzip(inBuf) {
    const { reject, resolve, promise } = defer();
    zlib.gzip(inBuf, function (error, outBuf) {
        if (error) {
            reject(error);
            return;
        }
        resolve(outBuf);
    })
    return await promise;
}

function dataToJsonBuffer(data) {
    try {
        const json = JSON.stringify(data, null, 2);
        return Buffer.from(json, 'utf8');
    } catch (error) {
        throw new Error('Error encoding data');
    }
}

async function attemptBufferStorage(filepath, buffer) {
    const { resolve, promise } = defer();
    fs.open(filepath, 'wx', 0o644, function (eopen, fd) {
        if (eopen) {
            logger.debug('Error creating target file: %s', eopen.code);
            resolve(0);
            return;
        }
        fs.write(fd, buffer, function (ewrite, written) {
            if (ewrite) {
                logger.debug('Error writing buffer to target file: %s', ewrite.code)
                resolve(0);
                return;
            }
            resolve(written);
        });
    });
    return await promise;
}

function defer() {
    let reject, resolve, promise = new Promise(function (res, rej) {
        reject = rej;
        resolve = res;
    });
    return Object.freeze({ reject, resolve, promise });
}

/*
 * Exports
 */

module.exports = gzipjson;
