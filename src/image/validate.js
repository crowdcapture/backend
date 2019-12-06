const uuid = require('uuid');
const queries = require('../../db/queries/image');

async function validate(req, res, next) {
    try {
        // Check if the image exists
        const image = await queries.getImage(req.params.id);

        if (image.length === 0) {
            throw({ success: false, status: 400, message: 'This id does not seem to exist' });
        }

        // Check if the image exists
        const reason = await queries.getRejectionReason(req.body.rejection_reason);

        if (reason.length === 0) {
            throw({ success: false, status: 400, message: 'This id does not seem to exist' });
        }

        const validation = {
            id: uuid.v4(),
            user: req.user.id,
            image: req.params.id,
            rejected: req.body.rejected,
            rejection_reason: req.body.rejection_reason
        };

        await queries.insertValidation(validation);

        res.status(200);
        res.send({
            success: true,
            message: 'Validation inserted'
        });
    } catch (error) {
        next(error);
    }
}

module.exports = validate;