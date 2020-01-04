const queries = require('../../db/queries/project');
const cache = require('memory-cache');

async function getProjects(req, res, next) {
    try {
        const cachedProject = cache.get('projects');
        let projects;

        if (cachedProject) {
            projects = cachedProject;
        } else {
            projects = await queries.getProjects();

            // The cache will keep this version of the projects for 5 minutes.
            cache.put('projects', projects, 300000);
        }
        
        if (projects.length === 0) {
            throw({ success: false, status: 400, message: 'No projects found at this moment' });
        }

        res.status(200);
        res.send({success: true, projects: projects});
    } catch (error) {
        next(error);
    }
}

module.exports = getProjects;