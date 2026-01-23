const db = require('../config/db');
const { HttpStatus } = require('../constants/httpStatusCodeConstant');

const checkPermission = (moduleName, action) => {
  return async (req, res, next) => {
    const query = `
      SELECT p.*
      FROM permissions p
      JOIN modules m ON m.id = p.module_id
      WHERE p.user_id=$1 AND m.module_name=$2
    `;

    const { rows } = await pool.query(query, [req.user.id, moduleName]);

    if (!rows.length || !rows[0][`can_${action}`]) {
      return res.status(403).json({ message: 'Permission denied' });
    }

    next();
  };
};

module.exports = checkPermission;
