const queries = require('../../db/queries/user');

async function confirmation(req, res, next) {
    try {
        await security(req.body.token);
        
        const user_validation = await queries.getUserWithToken(req.body.token);
        console.log(user_validation);
        
        await checkToken(user_validation);

        const user = await queries.getUserWithId(user_validation[0].user);
        await checkUser(user);
        
        await checkForOldToken(user_validation);
        await validateUser(user[0].id, req.body.token);

        res.status(200);
        res.send({
            success: true,
            id: user[0].id,
            message: 'User validated.'
        });
    } catch (error) {
        next(error);
    }
}

async function security(token) {
    return new Promise((resolve, reject) => {
        try {
            if (!token) {
                reject({status: 400, success: false, errorCode: 1002, message: 'A required value is missing or empty.'});
            }
    
            if (typeof(token) !== 'string') {
                reject({status: 400, success: false, errorCode: 1003, message: 'Invalid input.'});
            }
    
            if (token.length !== 16) {
                reject({status: 400, success: false, errorCode: 1003, message: 'Invalid input.'});
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
            } else if (user[0] && user[0].validated) { 
                reject({status: 400, success: false, errorCode: 1005, message: 'This account is already validated.'});
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
            const tokenDate = new Date(user_validation[0].validationTokenCreated);
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

async function validateUser(user_id, token) {
    return new Promise(async (resolve, reject) => {
        try {
            await queries.validateUser(user_id);
            await queries.validateUserValidation(user_id, token);

            resolve();
        } catch (error) {
            reject(error);
        }
    });
}

module.exports = confirmation;