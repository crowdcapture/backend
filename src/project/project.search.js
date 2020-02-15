const queries = require('../../db/queries/project');

async function search(req, res, next) {
    try {
        if (!req.body || !req.body.query) {
            throw({ success: false, status: 400, message: 'Some required properties where not set' });
        }

        let result;

        if (req.body.user_id && req.body.filter.createdBy === 'me') {
            result = await queries.searchByUser(req.body.query, req.body.user_id);
        } else {
            result = await queries.search(req.body.query);
        }

        res.status(200);
        res.send({
            success: true,
            result: result.rows || []
        });
    } catch (error) {
        next(error);
    }
}

module.exports = search;