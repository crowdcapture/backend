const emailValidator = require('email-validator');
const crypto = require('crypto');
const uuid = require('uuid');

const queries = require('../../db/queries/user');
const emailUtil = require('../util/mailjet');
const hashUtil = require('../util/hash');

async function register(req, res, next) {
    try {
        await security(req.body.email, req.body.username, req.body.password);

        await checkUsernameFormat(req.body.username);
        await checkUsername(req.body.username);
        await checkEmail(req.body.email);
        const user = await insertUser(req.body.email, req.body.username, req.body.password);
        
        res.status(200);
        res.send({
            success: true,
            id: user,
            message: 'User created.'
        });
    } catch (error) {
        console.log(error);
        
        next(error);
    }
}

async function security(email, username, password) {
    return new Promise((resolve, reject) => {
        try {
            if (!email || !username || !password) {
                reject({status: 400, success: false, errorCode: 1002, message: 'A required value is missing or empty.'});
            }
    
            if (typeof(email) !== 'string' || typeof(username) !== 'string' || typeof(password) !== 'string') {
                reject({status: 400, success: false, errorCode: 1003, message: 'Invalid input.'});
            }
    
            if (!emailValidator.validate(email)) {
                reject({status: 400, success: false, errorCode: 1007, message: 'This email address does not look valid.'});
            }
    
            if (username.length < 4 || username.length > 32) {
                reject({status: 400, success: false, errorCode: 1013, message: 'The length of an username should be between 4 and 32 characters.'});
            }
    
            if (password.length < 8) {
                reject({status: 400, success: false, errorCode: 1011, message: 'The minimum length of a password is 8 characters.'});
            }
    
            if (password.length > 512) {
                reject({status: 400, success: false, errorCode: 1012, message: 'The maximum length of a password is 512 characters.'});
            }

            resolve();
        } catch (error) {
            reject(error);
        }
    });
}

async function insertUser(email, username, password) {
    return new Promise(async (resolve, reject) => {
        try {
            const hash = await hashUtil.hashPassword(password);

            const user = {
                id: uuid.v4(),
                username,
                email,
                password: hash,
                created: new Date(),
                updated: new Date(),
                banned: false,
                moderator: false,
                validated: false
            }

            const user_id = await queries.insertUser(user);

            const user_validation = {
                id: uuid.v4(),
                validation_token: crypto.randomBytes(8).toString('hex'),
                validation_token_created: new Date(),
                user: user_id[0]
            }

            await queries.insertUserValidation(user_validation);

            await emailUtil.sendConfirmationEmail('https://crowdcapture.org', user.email, user_validation.validation_token);

            resolve(user_id[0]);
        } catch (error) {
            reject(error);
        }
    });
}

async function checkUsernameFormat(username) {
    return new Promise((resolve, reject) => {
        try {
            const result = /^[a-zA-Z0-9]+$/.test(username);

            if (result) {
                resolve();
            } else {
                reject({status: 400, success: false, errorCode: 1014, message: 'Usernames can only contain letters and numbers.'});
            }
        } catch (error) {
            reject(error);
        }
    });
}

async function checkUsername(username) {
    return new Promise(async (resolve, reject) => {
        try {
            const result = await queries.getUsername(username);
            
            if (result.length > 0) {
                reject({status: 400, success: false, errorCode: 1015, message: 'This username is already taken.'});
            } else {
                resolve();
            }
        } catch (error) {
            reject(error);
        }
    });
}

async function checkEmail(email) {
    return new Promise(async (resolve, reject) => {
        try {
            const result = await queries.getEmail(email);
            
            if (result.length > 0) {
                reject({status: 400, success: false, errorCode: 1016, message: 'This email is already taken.'});
            } else {
                resolve();
            }
        } catch (error) {
            reject(error);
        }
    });
}


module.exports = register;