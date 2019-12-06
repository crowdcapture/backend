const queries = require('../../db/queries/user');

async function logout(req, res, next) {
    try {
        const user = await queries.getUserWithId(req.user.id);

        await removeToken(user[0].id);

        res.status(200);
        res.send({
            success: true
        });
    } catch (error) {
        next(error);
    }
}

async function removeToken(user_id) {
    return new Promise(async (resolve, reject) => {
        try {
            await queries.removeToken(user_id);
            resolve();
        } catch (error) {
            reject(error);
        }
    });
}

module.exports = logout;