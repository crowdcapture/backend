const randomString = require('crypto-random-string');

function createRandom(length) {
    return randomString({length: length, characters: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'});
}

module.exports = {
    createRandom
}