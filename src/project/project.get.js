const queries = require('../../db/queries/project');
const cache = require('memory-cache');

async function getProject(req, res, next) {
    try {
        if (!req.params.id) {
            throw({ success: false, status: 400, message: 'Some required properties where not set' });
        }

        const cachedProject = cache.get(req.params.id);
        let project;

        if (cachedProject) {
            project = cachedProject;
        } else {
            project = await queries.getProject(req.params.id);

            // The cache will keep this version of the project for 5 minutes.
            // An update to the project should also update the cache.
            cache.put(req.params.id, project, 300000);
        }
        
        if (project.length === 0) {
            throw({ success: false, status: 400, message: 'This id does not seem to exist' });
        }

        res.status(200);
        res.send({success: true, project: project[0]});
    } catch (error) {
        next(error);
    }
}

module.exports = getProject;