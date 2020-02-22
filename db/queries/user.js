const knex = require('../knex');

function getUsername(username) {
    return knex('user')
        .where({username: username});
}

function getEmail(email) {
    return knex('user')
        .where({email: email});
}

function getUserProjects(user_id) {
    return knex.select('id', 'image_count', 'title').from('project')
        .where({
            created_by: user_id
        });
}

function getUserInfo(user_id) {
    return knex.select('id', 'username', 'created').from('user')
        .where({
            id: user_id
        });
}

function getUserWithId(user_id) {
    return knex('user')
        .where({id: user_id});
}

function getUserWithToken(token) {
    return knex('user_validation')
        .where({validation_token: token})
        .orderBy('validation_token_created', 'desc')
        .limit(1)
}

function insertUser(user) {
    return knex('user')
        .returning('id')
        .insert(user);
}

function insertUserValidation(user_validation) {
    return knex('user_validation')
        .insert(user_validation);
}

function insertToken(user_id, token) {
    return knex('user')
        .update({token: token, updated: new Date()})
        .where({id: user_id});
}

function insertPassword(hash, user_id) {
    return knex('user')
        .update({password: hash, updated: new Date(), validated: true})
        .where({id: user_id});
}

function validateUser(user_id) {
    return knex('user')
        .update({validated: true, validated_on: new Date(), updated: new Date()})
        .where({id: user_id});
}

function validateUserValidation(user_id, token) {
    return knex('user_validation')
        .update({validated_on: new Date()})
        .where({user: user_id, validation_token: token});
}

function removeToken(user_id) {
     return knex('user')
        .update({token: null, updated: new Date()})
        .where({id: user_id});
}

module.exports = {
    getUsername,
    getEmail,
    getUserWithId,
    getUserWithToken,
    getUserInfo,
    getUserProjects,
    insertUser,
    insertUserValidation,
    insertToken,
    insertPassword,
    validateUser,
    validateUserValidation,
    removeToken
}