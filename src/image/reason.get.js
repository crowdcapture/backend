const queries = require('../../db/queries/validation');
const cache = require('memory-cache');

async function getReasons(req, res, next) {
    try {
        const cachedReasons = cache.get('reasons');
        let reasons;

        if (cachedReasons) {
            reasons = cachedReasons;
        } else {
            reasons = await queries.getReasons();

            // The cache will keep the reasons cached for a day.
            cache.put('reasons', reasons, 86400000);
        }

        res.status(200);
        res.send({success: true, reasons: reasons });
    } catch (error) {
        next(error);
    }
}

module.exports = getReasons;