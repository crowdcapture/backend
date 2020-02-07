const jwt = require('jsonwebtoken');
const jwt_secret = process.env.JWT_SECRET;
const queries = require('../db/queries/user');

module.exports = async function (req, res, next) {
    const token = req.headers["x-access-token"];

    if (!jwt_secret) return res.status(500).send({ success: false, message: 'JwtSecret not set. '});

    if (!token) return res.status(401).send({ success: false, errorCode: 1001, message: 'Access denied.' });

    try {
        const decoded = jwt.verify(token, jwt_secret);
        // id, email, iat and exp are in the JSON webtoken.
        req.user = decoded;

        const user = await queries.getUserWithId(req.user.id);

        // Check for deleted users.
        if (user.length === 0) {
            throw new Error('This user does not exist.');
        }

        // TODO check for tokens in the blacklist

        next();
    } catch (error) {
        return res.status(400).send({ success: false, errorCode: 1000, message: 'Invalid token.' });
    }
};
