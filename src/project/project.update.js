const queries = require('../../db/queries/project');
const cache = require('memory-cache');
const uuidUtil = require('../util/uuid');

async function updateProject(req, res, next) {
    try {
        if (!req.body || !req.body.title || !req.body.id) {
            throw({ success: false, status: 400, message: 'Some required properties where not set' });
        }

        if (!uuidUtil.uuidValidator(req.body.id)) {
            throw({ success: false, status: 400, message: 'ID should be a valid UUID.' });
        }

        if (req.body.title.length > 64) {
            throw({ success: false, status: 400, message: 'The maximum length of the project title is 64 characters.' });
        }

        if (req.body.description.length > 1000) {
            throw { success: false, message: 'The maximum length of the project description is 3500 characters.' };
        }

        if (req.body.instruction.length > 500) {
            throw { success: false, message: 'The maximum length of the project instruction is 500 characters.' };
        }

        const existingProject = await queries.getProject(req.body.id);

        if (existingProject.length === 0) {
            throw({ success: false, status: 400, message: 'This project does not exist.' });
        }

        if (existingProject[0].created_by !== req.user.id) {
            throw({ success: false, status: 400, message: 'You do not have permission to change this project.' });
        }

        const update = {
            title: req.body.title,
            description: req.body.description,
            instruction: req.body.instruction,
            updated: new Date()
        };

        await queries.updateProject(update, req.body.id);

        const project = await queries.getProject(req.body.id);
        cache.put(req.body.id, project, 300000);

        res.status(200);
        res.send({
            success: true,
            id: req.body.id
        });
    } catch(error) {
        next(error);
    }
}

module.exports = updateProject;