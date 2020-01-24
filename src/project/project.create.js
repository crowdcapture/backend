const queries = require('../../db/queries/project');
const uuid = require('uuid');
const cache = require('memory-cache');

async function createProject(req, res, next) {
    if (!req.body || !req.body.title || !req.body.description) {
        res.status(400).json({success: false, message: 'Some required properties where not set'});
        return;
    }

    try {
        if (req.body.title.length > 64) {
            throw { success: false, message: 'The maximum length of the project title is 64 characters.' };
        }

        if (req.body.description.length > 3500) {
            throw { success: false, message: 'The maximum length of the project description is 3500 characters.' };
        }

        if (req.body.instruction.length > 500) {
            throw { success: false, message: 'The maximum length of the project description is 500 characters.' };
        }

        const project = {
            id: uuid.v4(),
            title: req.body.title,
            description: req.body.description,
            instruction: req.body.instruction,
            minHeight: req.body.minHeight,
            minWidth: req.body.minWidth,
            created: new Date(),
            created_by: req.user.id,
            updated: new Date(),
            image_count: 0,
            banned: false
        }

        await queries.insertProject(project);

        // Remove the projects cache as it is now not up to date anymore.
        cache.del('projects');

        res.status(200);
        res.send({
            success: true,
            project: project
        });
    } catch(error) {
        next(error);
    }
}

module.exports = createProject;