const knex = require('../knex');

function insertValidation(validation) {
    return knex('validation')
        .insert(
            validation
        );
}

function getValidationFromImage(imageId) {
    return knex('validation')
        .where({
            image: imageId
        });
}

function getRejectionReason(rejection_id) {
    return knex('rejection_reason')
        .where({ id: rejection_id });
}

module.exports = {
    insertValidation,
    getRejectionReason,
    getValidationFromImage
}