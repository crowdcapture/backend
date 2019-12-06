const queries = require('../../db/queries/user');
const emailValidator = require('email-validator');
const crypto = require('crypto');
const uuid = require('uuid');

const emailUtil = require('../util/mailjet');

async function reset(req, res, next) {
    try {
        await security(req.body.email);

        const user = await queries.getEmail(req.body.email);

        await checkEmail(user);
        await checkUser(user);
        await insertUserValidation(user);

        res.status(200);
        res.send({
            success: true,
            id: user[0].id,
            message: 'Password reset initiated.'
        });
    } catch (error) {
        next(error);
    }
}

async function security(email) {
    return new Promise((resolve, reject) => {
        try {
            if (!email) {
                reject({status: 400, success: false, errorCode: 1002, message: 'A required value is missing or empty.'});
            }
    
            if (typeof(email) !== 'string') {
                reject({status: 400, success: false, errorCode: 1003, message: 'Invalid input.'});
            }

            if (!emailValidator.validate(email)) {
                reject({status: 400, success: false, errorCode: 1007, message: 'This email address does not look valid.'});
            }

            resolve();
        } catch (error) {
            reject(error);
        }
    });
}

async function checkEmail(user) {
    return new Promise(async (resolve, reject) => {
        try {
            if (user.length === 0) {
                reject({status: 400, success: false, errorCode: 1017, message: 'This email was not found.'});
            } else {
                resolve();
            }
        } catch (error) {
            reject(error);
        }
    });
}

async function checkUser(user) {
    return new Promise((resolve, reject) => {
        try {
            if (user[0] && user[0].validated && !user[0].banned) {
                resolve();
            } else if (user[0] && user[0].banned) {
                reject({status: 400, success: false, errorCode: 1004, message: 'This account is not active, contact customer service.'});
            }

        } catch (error) {
            reject(error);
        }
    });
}

async function insertUserValidation(user) {
    return new Promise(async (resolve, reject) => {
        try {
            const user_validation = {
                id: uuid.v4(),
                user: user[0].id,
                validation_token: await crypto.randomBytes(8).toString('hex'),
                validation_token_created: new Date()
            }

            await queries.insertUserValidation(user_validation);

            await emailUtil.sendResetEmail('https://crowdcapture.org', user[0].email, user_validation.validation_token, user[0].username);

            resolve();
        } catch (error) {
            reject(error);
        }
    });
}

module.exports = reset;