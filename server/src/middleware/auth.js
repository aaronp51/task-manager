import jwt from 'jsonwebtoken';

// used to authenticate JWT before giving access to routes
function authenticateToken(req, res, next) {
    try {
        const authHeader = req.headers.authorization; // authHeader expected value should be "Bearer abc123..."
        const token = authHeader?.split(' ')[1];
        if (!token) {
            return res.status(401).json("Authentication required");
        }
        const decodedToken = jwt.verify(
            token,
            process.env.JWT_SECRET,
        );
        req.user = decodedToken;
        next();
    } catch (e) {
        return res.status(403).json("Invalid or expire token");
    }
}

export default authenticateToken;