const jwt = require('jsonwebtoken');

const verifyAdmin = (req, res, next) => {
  const token = req.cookies?.adminToken;

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized. Token missing.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== 'admin') {
      return res.status(403).json({ error: 'Access denied. Admins only.' });
    }

    req.admin = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
};

module.exports = verifyAdmin;
