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

function getImages(project_id) {
    return knex.raw(`SELECT id, filename, url FROM image WHERE "project" = '${project_id}' AND "banned" = false ORDER BY random() limit 15;`);
}

function getImagesValidated(project_id) {
    return knex('image')
        .count()
        .where({
            project: project_id,
            banned: false,
            validated: true
        });
}

function getImagesTotal(project_id) {
    return knex('image')
        .count()
        .where({
            banned: false,
            project: project_id
        });
}

module.exports = {
    insertImages,
    getImage,
    getImages,
    getImagesTotal,
    getImagesValidated
}