const queries = require('../../db/queries/image');
const projectQueries = require('../../db/queries/project');
const uuidUtil = require('../util/uuid');

async function getImages(req, res, next) {
    try {
        if (!req.params.id) {
            throw({ success: false, status: 400, message: 'Some required properties where not set' });
        }

        if (!uuidUtil.uuidValidator(req.params.id)) {
            throw({ success: false, status: 400, message: 'ID should be a valid UUID.' });
        }

        // Check if the project exists
        const project = await projectQueries.getProject(req.params.id);

        if (project.length === 0) {
            throw({ success: false, status: 400, message: 'This id does not seem to exist' });
        }

        let [imagesValidated, imagesTotal, images] = await Promise.all([
            await queries.getImagesValidated(req.params.id),
            await queries.getImagesTotal(req.params.id),
            await queries.getImages(req.params.id)
        ]);

        res.status(200);
        res.send({
            success: true,
            imagesTotal: imagesTotal[0].count,
            imagesValidated: imagesValidated[0].count,
            images: images.rows
        });
    } catch (error) {
        next(error);
    }
}

module.exports = getImages;