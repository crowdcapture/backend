const queries = require('../../db/queries/image');
const uuidUtil = require('../util/uuid');
const projectQueries = require('../../db/queries/project');

async function getValidation(req, res, next) {
    try {
        if (!uuidUtil.uuidValidator(req.params.projectId)) {
            throw({ success: false, status: 400, message: 'ID should be a valid UUID.' });
        }

        const project = await projectQueries.getProject(req.params.projectId);

        if (project.length === 0) {
            throw({ success: false, status: 400, message: 'This id does not seem to exist' });
        }

        const image = await queries.getImagesUnvalidated(req.params.projectId, req.user.id);

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