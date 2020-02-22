const queries = require('../../db/queries/user');
const cache = require('memory-cache');
const uuidUtil = require('../util/uuid');

async function getProject(req, res, next) {
    try {
        if (!req.params.id) {
            throw({ success: false, status: 400, message: 'Some required properties where not set' });
        }

        if (!uuidUtil.uuidValidator(req.params.id)) {
            throw({ success: false, status: 400, message: 'ID should be a valid UUID.' });
        }

        const user = await queries.getUserInfo(req.params.id);
        
        if (user.length === 0) {
            throw({ success: false, status: 400, message: 'This id does not seem to exist' });
        }

        const projects = await queries.getUserProjects(req.params.id);

        res.status(200);
        res.send({success: true, projects: projects, user: user[0]});
    } catch (error) {
        next(error);
    }
}

module.exports = getProject;