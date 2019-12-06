const queries = require('../../db/queries/user');
const hashUtil = require('../util/hash');

async function password(req, res, next) {
    try {
        await security(req.body.token, req.body.password);

        // Get user with token
        const user_validation = await queries.getUserWithToken(req.body.token);
        await checkToken(user_validation);

        const user = await queries.getUserWithId(user_validation[0].user);
        await checkUser(user);

        await checkForOldToken(user_validation);

        // Insert new hashed password in db
        await insertNewPassword(req.body.password, user[0].id);

        // Validate user validation
        await validateUserValidation(user[0].id, req.body.token);

        res.status(200);
        res.send({
            success: true,
            id: user[0].id,
            message: 'Password reset successful.'
        });
    } catch (error) {
        next(error);
    }
}

async function security(token, password) {
    return new Promise((resolve, reject) => {
        try {
            if (!token && !password) {
                reject({status: 400, success: false, errorCode: 1002, message: 'A required value is missing or empty.'});
            }
    
            if (typeof(token) !== 'string' || typeof(password) !== 'string') {
                reject({status: 400, success: false, errorCode: 1003, message: 'Invalid input.'});
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

async function checkToken(user_validation) {
    return new Promise(async (resolve, reject) => {
        try {
            if (user_validation.length === 0) {
                reject({status: 400, success: false, errorCode: 1003, message: 'Invalid input.'});
            } else {
                resolve();
            }
        } catch (error) {
            reject(error);
        }
    });
}

async function checkUser(user) {
    return new Promise(async (resolve, reject) => {
        try {
            if (user[0] && user[0].banned) {
                reject({status: 400, success: false, errorCode: 1004, message: 'This account is not active, contact customer service.'});
            } else {
                resolve();
            }
        } catch (error) {
            reject(error);
        }
    });
}

async function checkForOldToken(user_validation) {
    return new Promise((resolve, reject) => {
        try {
            const tokenDate = new Date(user_validation[0].validation_token_created);
            const now = new Date();

            const timeDifference = Math.abs(now.getTime() - tokenDate.getTime());

            if (timeDifference / (1000 * 3600) > 24) {
                reject({status: 400, success: false, errorCode: 1006, message: 'This confirmation token is not valid anymore.'});
            }

            resolve();
        } catch (error) {
            reject(error);
        }
    });
}

async function insertNewPassword(password, user_id) {
    return new Promise(async (resolve, reject) => {
        try {
            const hashedPassword = await hashUtil.hashPassword(password);

            await queries.insertPassword(hashedPassword, user_id);

            resolve();
        } catch (error) {
            reject(error);
        }
    });
}

async function validateUserValidation(user_id, token) {
    return new Promise(async (resolve, reject) => {
        try {
            await queries.validateUserValidation(user_id, token);

            resolve();
        } catch (error) {
            reject(error);
        }
    });
}

module.exports = password;