const queries = require('../../db/queries/project');
const cache = require('memory-cache');

async function getPopularProjects(req, res, next) {
    try {
        const cachedProject = cache.get('popular');
        let projects;

        if (cachedProject) {
            projects = cachedProject;
        } else {
            projects = await queries.getPopularProjects();

            // The cache will keep this version of the projects for 5 minutes.
            cache.put('popular', projects, 7200000);
        }

        res.status(200);
        res.send({
            success: true, projects: projects || []
        });
    } catch (error) {
        next(error);
    }
}

module.exports = getPopularProjects;