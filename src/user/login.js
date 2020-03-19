const emailValidator = require('email-validator');
const webtoken = require('jsonwebtoken');

const queries = require('../../db/queries/user');
const hashUtil = require('../util/hash');

async function login(req, res, next) {
    try {
        const email = req.body.email.toLowerCase().trim();

        await security(email, req.body.password);
        const user = await queries.getEmail(email);

        await checkEmail(user);
        await checkUserStatus(user);
        await checkPassword(user, req.body.password);
        const token = await insertToken(user);

        res.status(200);
        res.send({
            success: true,
            id: user[0].id,
            username: user[0].username,
            token: token
        });
    } catch (error) {
        console.log(error);
        
        next(error);
    }
}

async function security(email, password) {
    return new Promise((resolve, reject) => {
        try {
            if (!email || !password) {
                reject({status: 400, success: false, errorCode: 1002, message: 'A required value is missing or empty.'});
            }
    
            if (typeof(email) !== 'string' || typeof(password) !== 'string') {
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
                reject({status: 400, success: false, errorCode: 1009, message: 'This combination between password and e-mailadress was not found.'});
            } else {
                resolve();
            }
        } catch (error) {
            reject(error);
        }
    });
}

async function checkUserStatus(user) {
    return new Promise((resolve, reject) => {
        try {
            if (user[0] && user[0].validated && !user[0].banned) {
                resolve();
            } else if (user[0] && !user[0].validated) {
                reject({status: 400, success: false, errorCode: 1010, message: 'This account is not validated yet, click the link in the e-mail.'});
            } else if (user[0] && user[0].banned) {
                reject({status: 400, success: false, errorCode: 1004, message: 'This account is not active, contact customer service.'});
            }
        } catch (error) {
            reject(error);
        }
    });
}

async function checkPassword(user, password) {
    return new Promise(async (resolve, reject) => {
        try {
            const hashedPass = await hashUtil.comparePassword(password, user[0].password);

            if (!hashedPass) {
                reject({ status: 400, success: false, errorCode: 1009, message: 'This combination between password and e-mailadress was not found.'});
            }

            resolve();
        } catch (error) {
            reject(error);
        }
    });
}

async function insertToken(user) {
    return new Promise(async (resolve, reject) => {
        try {
            const jwt = webtoken.sign({
                id: user[0].id,
                email: user[0].email
            }, process.env.JWT_SECRET, {
                expiresIn: '5d'
            });

            await queries.insertToken(user[0].id, jwt);

            resolve(jwt);
        } catch (error) {
            reject(error);
        }
    });
}

module.exports = login;