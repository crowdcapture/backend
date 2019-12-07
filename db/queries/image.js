const knex = require('../knex');

function insertImages(images) {
    return knex('image')
        .insert(
            images
        );
}

function getImage(image_id) {
    return knex('image')
        .where({ id: image_id });
}

module.exports = {
    insertImages,
    getImage
}