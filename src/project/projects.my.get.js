const queries = require('../../db/queries/project');

async function getMyProjects(req, res, next) {
    try {
        const projects = await queries.getMyProjects(req.user.id);

        res.status(200);
        res.send({
            success: true, projects: projects || []
        });
    } catch (error) {
        next(error);
    }
}

module.exports = getMyProjects;