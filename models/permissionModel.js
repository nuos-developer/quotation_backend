const { pool } = require('../config/dbConn');

module.exports = {
  getUserPermissions: async (userId, roleId) => {
    const query = `
      SELECT 
        m.module_name,
        p.can_create,
        p.can_view,
        p.can_update,
        p.can_delete
      FROM permissions p
      JOIN modules m ON m.id = p.module_id
      WHERE p.user_id = $1 AND p.role_id = $2
      AND (
        p.can_view = true 
        OR p.can_create = true 
        OR p.can_update = true 
        OR p.can_delete = true
      )
    `;
    const { rows } = await pool.query(query, [userId, roleId]);
    return rows;
  },

  getRoleLevel: async (roleId) => {
    const { rows } = await pool.query(
      `SELECT level FROM roles WHERE id = $1`,
      [roleId]
    );
    return rows[0]?.level;
  }
};
