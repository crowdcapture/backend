const uuid = require('uuid');
const imageQueries = require('../../db/queries/image');
const queries = require('../../db/queries/validation');

async function validate(req, res, next) {
    try {
        // Check if the image exists
        const image = await imageQueries.getImage(req.params.id);

        if (image.length === 0) {
            throw({ success: false, status: 400, message: 'This id does not seem to exist' });
        }

        if (req.user.id === image[0].created_by) {
            throw({ success: false, status: 400, message: 'You can not validate your own image'});
        }

        const imageValidation = await queries.getValidationFromImage(image[0].id);

        if (imageValidation.length > 0) {
            throw({ success: false, status: 400, message: 'This image has already been validated'});
        }

        // Check if rejection reason exists
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