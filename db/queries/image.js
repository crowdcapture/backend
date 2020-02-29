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
    return knex.raw(`SELECT id, filename, url, "urlSmall", "widthSmall", "heightSmall" FROM image WHERE "project" = ? AND "banned" = false AND "validated" = true AND "approved" = true ORDER BY random() limit 15;`, [project_id]);
}

function getImageBySHA(sha_256, project_id) {
    return knex('image')
        .where({
            project: project_id,
            sha_256: sha_256
        });
}

function getImagesValidated(project_id) {
    return knex('image')
        .count()
        .where({
            project: project_id,
            banned: false,
            validated: true,
            approved: true
        });
}

function getImagesWaiting(project_id) {
    return knex('image')
        .count()
        .where({
            project: project_id,
            banned: false,
            validated: false
        });
}

function getImagesUnvalidated(project_id, user_id) {
    return knex('image')
        .where({
            project: project_id,
            banned: false,
            validated: false
        })
        .whereNot({
            created_by: user_id
        })
        .andWhereRaw("(validating IS NULL OR validating < NOW() - INTERVAL '15 minutes')")
        .orderBy('created')
        .limit(1);
}

function imageIsValidating(image_id) {
    return knex('image')
        .where({
            id: image_id
        })
        .update({
            validating: new Date()
        });
}

function updateImage(image, image_id) {
    return knex('image')
        .where({id: image_id})
        .update(image);
}

module.exports = {
    insertImages,
    imageIsValidating,
    getImage,
    getImageBySHA,
    getImages,
    getImagesWaiting,
    getImagesValidated,
    getImagesUnvalidated,
    updateImage
}