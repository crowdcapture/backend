const knex = require('../knex');

function insertImages(images) {
    return knex('image')
        .insert(
            images
        );
}

function insertValidation(validation) {
    return knex('validation')
        .insert(
            validation
        );
}

function getImage(image_id) {
    return knex('image')
        .where({ id: image_id });
}

function getRejectionReason(rejection_id) {
    return knex('rejection_reason')
        .where({ id: rejection_id });
}

module.exports = {
    insertImages,
    insertValidation,
    getImage,
    getRejectionReason
}