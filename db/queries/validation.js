const knex = require('../knex');

function insertValidation(validation) {
    return knex('validation')
        .insert(
            validation
        );
}

function updateImage(imageID, imageInfo) {
    return knex('image')
        .update(
            imageInfo
        )
        .where({
            id: imageID
        });
}

function getValidationFromImage(imageId) {
    return knex('validation')
        .where({
            image: imageId
        });
}

function getRejectionReason(rejection_id) {
    return knex('rejection_reason')
        .where({ 
            id: rejection_id 
        });
}

module.exports = {
    updateImage,
    insertValidation,
    getRejectionReason,
    getValidationFromImage
}