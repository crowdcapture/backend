const queries = require('../../db/queries/image');

async function getValidation(req, res, next) {
    try {
        const image = await queries.getImagesUnvalidated(req.params.projectId);

        if (image.length > 0) {
            await queries.imageIsValidating(image[0].id);
        }

        res.status(200);
        res.send({
            success: true,
            image: image
        });
    } catch (error) {
        next(error);
    }
}

module.exports = getValidation;