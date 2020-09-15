const jwt = require('jsonwebtoken');
const config = require('config');

module.exports = (req, res, next) => {
    if (req === 'OPTIONS') {
        return next();
    }

    try {
        const token = req.headers.authorization.split(' ')[1];

        if (!token) {
            return res.status(401).json({
                message: 'No authorization'
            });
        }

        const decoded = jwt.verify(token, congif.get('jstSecret'));
        req.user = decoded;
        next();
    } catch (e) {
        if (!token) {
            return res.status(401).json({
                message: 'No authorization'
            });
        }
    }
}
