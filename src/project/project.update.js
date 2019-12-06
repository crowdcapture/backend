const queries = require('../../db/queries/project');
const cache = require('memory-cache');

async function updateProject(req, res, next) {
    try {
        if (!req.body || !req.body.title || !req.body.id) {
            throw({ success: false, status: 400, message: 'Some required properties where not set' });
        }

        if (req.body.title.length > 64) {
            throw({ success: false, status: 400, message: 'The maximum length of the project title is 64 characters.' });
        }

        const existingProject = await queries.getProject(req.body.id);

        if (existingProject.length === 0) {
            throw({ success: false, status: 400, message: 'This project does not exist.' });
        }

        if (existingProject[0].created_by !== req.user.id) {
            throw({ success: false, status: 400, message: 'You do not have permission to change this project.' });
        }

        const project = existingProject[0];

        project.title = req.body.title;
        project.description = req.body.description;
        project.instruction = req.body.instruction;
        project.updated = new Date();

        await queries.updateProject(project, req.body.id);
        
        cache.put(project.id, project, 300000);

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