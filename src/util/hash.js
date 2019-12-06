const crypto = require('crypto');
const fs = require('fs');
const bcrypt = require('bcryptjs');

async function hashPassword(password) {
    return new Promise((resolve, reject) => {
        bcrypt.genSalt(12, (error, salt) => {
            if(error) {
                reject({status: 500, success: false, errorCode: 1019, message: 'Salting failed.'});
            } else {
                bcrypt.hash(password, salt, (error, hash) => {
                    if(error) {
                        reject({status: 500, success: false, errorCode: 1018, message: 'Hashing failed.'});
                    } else {
                        resolve(hash);
                    }
                });
            }
        });
    });
}

async function comparePassword(password, hash) {
    return new Promise((resolve, reject) => {
        bcrypt.compare(password, hash, (error, result) => {
            if(error) {
                reject(error);
            }

            resolve(result);
        });
    });
}

/**
 * Create a sha256 hash based on inputted data.
 * @param {data} data
 */
async function createHash(data) {
    return new Promise((resolve, reject) => {
        try {
            const hash = crypto.createHash('sha256');
            let hashedData;
            try {
                hash.update(data);
                hashedData = hash.digest('hex');
            } catch (error) {
                console.log(error);
            }

            resolve(hashedData);
        } catch (error) {
            reject({success: false, message: 'Hashing failed', error: error});
        }
    });
}

/**
 * Create a sha256 hash based on inputted filepath.
 * @param {filePath} filePath
 */
async function createHashFromFile(filePath) {
    return new Promise((resolve, reject) => {
        try {
            // Haal data op voor hash
            const data = fs.ReadStream(filePath);
            const hash = crypto.createHash('sha256');
            let hashedData;

            data.on('data', (d) => {
                hash.update(d);
            });

            data.on('end', () => {
                hashedData = hash.digest('hex');
                resolve(hashedData);
            });
        } catch (error) {
            reject({success: false, message: 'Hashing from file failed', error: error});
        }
    });
}

module.exports = {
    createHash: createHash,
    createHashFromFile: createHashFromFile,
    hashPassword,
    comparePassword
}