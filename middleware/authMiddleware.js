const jwt = require('jsonwebtoken');
const { HttpStatus } = require('../constants/httpStatusCodeConstant');
const { HttpMessage } = require('../constants/httpStatusMessageConstant');

const authMiddleware = (role) => 
  {
  return (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ message: 'Unauthorized' });

    try {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      next();
    } catch {
      return res.status(401).json({ message: 'Invalid token' });
    }
  };
};

module.exports = authMiddleware;


