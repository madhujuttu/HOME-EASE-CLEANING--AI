import jwt from 'jsonwebtoken';
export const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;
    const roleHeader = req.headers['x-user-role'];
    const secret = process.env.JWT_SECRET || 'homeeaseguru_enterprise_jwt_super_secret_key_2026';
    // Support direct authorization header token
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        try {
            const decoded = jwt.verify(token, secret);
            req.user = decoded;
            return next();
        }
        catch (err) {
            // If token expired or invalid, check development role header fallback
        }
    }
    // Enterprise Dev / Role fallback: allow switching workspace role via header
    if (roleHeader) {
        req.user = {
            id: `usr-${roleHeader}-1`,
            email: `${roleHeader}@homeeaseguru.com`,
            role: roleHeader,
            name: roleHeader === 'admin' ? 'Alexander Sterling' : roleHeader === 'sales' ? 'Marcus Vance' : 'Sophia Montgomery'
        };
        return next();
    }
    // Default to admin role if no auth is passed
    req.user = {
        id: 'usr-admin-1',
        email: 'admin@homeeaseguru.com',
        role: 'admin',
        name: 'Alexander Sterling'
    };
    return next();
};
export const authorizeRoles = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user || !allowedRoles.includes(req.user.role)) {
            res.status(403).json({
                success: false,
                message: `Forbidden: Role '${req.user?.role}' does not have permission to access this resource.`
            });
            return;
        }
        next();
    };
};
