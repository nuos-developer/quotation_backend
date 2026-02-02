
const { pool } = require('../config/dbConn');

const dbModel = {

  checkUserByMobNum: async (mobileNumber, emalId) => {
    try {
      console.log(mobileNumber);

      const query = `
      SELECT id
      FROM users
      WHERE mobile_number = $1 AND email_id = $2
        AND deleted_at IS NULL
      LIMIT 1
    `;

      const result = await pool.query(query, [mobileNumber, emalId]);

      return result.rows[0] || null;
    } catch (error) {
      console.error('DB Error (findUserByMobile):', error);
      throw error;
    }
  },
  register: async (reqBody, salt, hashedPassword) => {

    const {
      first_name,
      last_name,
      user_name,
      mobile_number,
      email_id,
      role_name,

      // details table fields
      address,
      pin_code,
      country,
      state,
      district,
      taluk,
      division,
      region,
      company_name,
      gst_name,
      company_address
    } = reqBody;

    const client = await pool.connect();

    try {
      // 🔐 START TRANSACTION
      await client.query('BEGIN');

      /* ---------- INSERT INTO USERS ---------- */
      const userQuery = `
        INSERT INTO users (
          first_name,
          last_name,
          user_name,
          mobile_number,
          email_id,
          password,
          salt_password,
          role_name
        )
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
        RETURNING id, first_name, email_id
      `;

      const userValues = [
        first_name,
        last_name,
        user_name,
        mobile_number,
        email_id,
        hashedPassword,
        salt,
        role_name
      ];

      const userResult = await client.query(userQuery, userValues);
      const userId = userResult.rows[0].id;

      /* ---------- INSERT INTO USERS_DETAILS ---------- */
      const detailsQuery = `
        INSERT INTO users_details (
          user_id,
          address,
          pin_code,
          country,
          state,
          district,
          taluk,
          division,
          region,
          company_name,
          gst_name,
          company_address
        )
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
      `;

      const detailsValues = [
        userId,
        address,
        pin_code,
        country,
        state,
        district,
        taluk,
        division,
        region,
        company_name,
        gst_name,
        company_address
      ];

      await client.query(detailsQuery, detailsValues);

      // ✅ COMMIT TRANSACTION
      await client.query('COMMIT');

      return userResult.rows[0];

    } catch (error) {
      // ❌ ROLLBACK IF ANY FAILS
      await client.query('ROLLBACK');
      console.error('Error registering user:', error);
      throw error;

    } finally {
      client.release();
    }
  },

  updateLoginStatus: async (userId) => {
    try {
      const query = `UPDATE users SET is_login = true WHERE id = $1`;
      const result = await pool.query(query, [userId]);

      if (result.rowCount === 0) {
        console.error(`No user found with id ${userId}`);
        return null;
      }

      return result.rows[0]; // returns updated user id and login status
    } catch (error) {
      console.error('Error updating login status:', error);
      throw error; // rethrow if you want to handle it higher
    }
  },

  // assignPartnerRole: async (reqBody, adminId) => {
  //   try {
  //     console.log(reqBody);

  //     const { user_id, partner_type_id, continent_id, country_id, zone_id, state_id, city_id } = reqBody

  //     const query = `INSERT INTO user_role_mapping (user_id, partner_type_id, continent_id, country_id, zone_id, state_id, city_id, assign_by)
  //                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8 )RETURNING *`
  //     const values = [
  //       user_id, partner_type_id, continent_id, country_id, zone_id, state_id, city_id, adminId
  //     ];

  //     const result = await pool.query(query, values);
  //     return result.rows[0];


  //   } catch (error) {
  //     console.error('Error at (assignPartnerRole):', error);
  //     throw error
  //   }
  // },

  // fatchPermission: async (userId, adminId) => {
  //   try {
  //     console.log('userID :>>>>>>', userId);

  //     const result = await pool.query(
  //       `SELECT p.id "partnerId", p.partner_name, c.id "continentId", c.continents_name, c2.id "CountryId", c2.country_name, 
  //               z.id "zoneId", z.zone_name ,s.id "stateId", s.state_name, d.id "distId", d.dist_name 
  //         FROM user_role_mapping urm 
  //         INNER JOIN partners p ON p.id  = urm.partner_type_id
  //         INNER JOIN continents c  ON c.id = urm.continent_id 
  //         INNER JOIN countries c2 ON c2.id = urm.country_id 
  //         INNER JOIN zones z ON z.id = urm.zone_id 
  //         INNER JOIN states s ON s.id = urm.state_id 
  //         INNER JOIN districts d ON d.id = urm.city_id 
  //         WHERE urm.user_id  = $1 AND urm.deleted_by IS NULL`,
  //       [userId]
  //     );
  //     return {
  //       success: true,
  //       message: 'User info fatch successfully',
  //       data: result.rows,
  //     };
  //   } catch (error) {
  //     console.error('Error finding admin by email:', error);
  //     throw error;
  //   }

  // },

  // updateUserPermission: async (reqBody) => {
  //   try {

  //     const { } = reqBody
  //     const query = `UPDATE user_role_mapping urm 
  //                     SET urm.user_id = $1, urm.partner_type_id = $2, urm.continent_id = $3, urm.country_id = $4, urm.zone_id = $5, urm.state_id = $6, urm.city_id = $7, urm.channel_id = $8, urm.updated_by = $9 WHERE urm.user_id = $10`;

  //     const values = [

  //     ];

  //     console.log('values :>>>>>>', values);

  //     const result = await pool.query(query, values);

  //     return {
  //       success: true,
  //       data: result.rows[0],
  //     };

  //   } catch (error) {
  //     console.error('Error finding admin by email:', error);
  //     throw error;
  //   }
  // },

  getUsers: async () => {
    try {
      // const { } = reqBody
      const query =
        `SELECT U.id, U.user_name, U.first_name, U.last_name, U.email_id, U.mobile_number, UD.address, UD.pin_code , UD.country , UD.state , UD.district , UD.taluk, UD.division , 
                  UD.region ,
                  UD.company_address , UD.company_name, UD.gst_name, u.role_name , u.is_admin_approve
                  FROM users u 
                  INNER JOIN users_details ud ON U.ID = ud.user_id 
                  where u.role_name != 'Admin' AND u.deleted_at IS NULL ORDER BY u.id DESC`;

      const result = await pool.query(query);

      return {
        success: true,
        data: result.rows,
      };

    } catch (error) {
      console.error('Error finding admin by email:', error);
      throw error;
    }
  },

  logOutUser: async (userId) => {
    try {
      const query = `
      UPDATE users 
      SET logout_time = NOW() 
      WHERE id = $1 AND is_active = true
      RETURNING id, logout_time;
    `;

      const values = [userId];

      console.log('Logging out user :>>>>>>', userId);

      const result = await pool.query(query, values);

      return {
        success: true,
        data: result.rows[0] || null,
      };
    } catch (error) {
      console.error("Error in logOutUser:", error);

      return {
        success: false,
        message: "Failed to log out user",
        error,
      };
    }
  },

assignPartnerRoleBulk: async (userId, roleId, permissions, adminId) => {
  const client = await pool.connect();

  console.log(userId, roleId, permissions, adminId);

  try {
    await client.query('BEGIN');

    const query = `
      INSERT INTO permissions
        (user_id, role_id, module_id, can_create, can_view, can_update, can_delete, assigned_by)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
      ON CONFLICT (user_id, role_id, module_id)
      DO UPDATE SET
        can_create = EXCLUDED.can_create,
        can_view   = EXCLUDED.can_view,
        can_update = EXCLUDED.can_update,
        can_delete = EXCLUDED.can_delete,
        assigned_by = EXCLUDED.assigned_by,
        updated_at = NOW();
    `;

    for (const m of permissions) {
      await client.query(query, [
        userId,
        roleId,
        m.module_id,
        m.can_create,
        m.can_view,
        m.can_update,
        m.can_delete,
        adminId
      ]);
    }

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error assigning permissions:', error);
    throw error;
  } finally {
    client.release();
  }
},

  approvePermissiopn: async (role_id, user_id, adminId, is_admin_approve) => {

    try {
      const query = `UPDATE users SET is_admin_approve = $1, role_id = $2, updated_by = $3 WHERE id = $4`;
      const result = await pool.query(query, [is_admin_approve, role_id, adminId, user_id]);

      if (result.rowCount === 0) {
        console.error(`No user found with id ${user_id}`);
        return null;
      }

      return result.rows[0]; // returns updated user id and login status
    } catch (error) {
      console.error('Error updating login status:', error);
      throw error; // rethrow if you want to handle it higher
    }
  },



  getUserById: async (userId) => {
    const { rows } = await pool.query(
      `
    SELECT u.id, r.level AS role_level, u.first_name, u.last_name, u.user_name, u.mobile_number, u.email_id
    FROM users u
    JOIN roles r ON r.id = u.role_id
    WHERE u.id = $1
    `,
      [userId]
    );
    return rows[0];
  },

  fetchPermission: async (userId) => {
    const { rows } = await pool.query(
      `
    SELECT 
      m.id AS module_id,
      m.module_name,
      r.id AS role_id,
      r.role_name,
      p.can_create,
      p.can_view,
      p.can_update,
      p.can_delete
    FROM permissions p
    JOIN modules m ON m.id = p.module_id
    JOIN roles r ON r.id = p.role_id
    WHERE p.user_id = $1
    ORDER BY m.id
    `,
      [userId]
    );

    return { success: true, data: rows };
  },


  getDashboardCounts: async () => {

    const roleWiseQuery = `
               SELECT
                r.role_name, r.id,
                COUNT(u.id) AS total_users,
                COUNT(CASE WHEN u.is_admin_approve = 'PENDING' THEN 1 END) AS pending_users,
                COUNT(CASE WHEN u.is_admin_approve = 'APPROVED' THEN 1 END) AS approved_users
              FROM roles r
              LEFT JOIN users u
                ON u.role_id = r.id
               AND u.deleted_by IS NULL
              WHERE r.role_name <> 'Admin'
              GROUP BY r.id, r.role_name
              ORDER BY r.id ASC;
              `;

    const productProposalQuery = `
      SELECT
        (SELECT COUNT(*) FROM products WHERE deleted_by IS NULL) AS total_products,
        (SELECT COUNT(*) FROM products WHERE is_active = true  AND deleted_by IS NULL) AS active_products,
        (SELECT COUNT(*) FROM products WHERE is_active = false AND deleted_by IS NULL) AS inactive_products,
        (SELECT COUNT(*) FROM proposals WHERE deleted_by IS NULL) AS total_proposals;
    `;

    const [roleResult, productResult] = await Promise.all([
      pool.query(roleWiseQuery),
      pool.query(productProposalQuery)
    ]);

    return {
      roleWiseUsers: roleResult.rows,
      summary: productResult.rows[0]
    };
  },



  updateUserPermission: async (data, userId) => {
    const { module_id, permissions } = data;

    const query = `
    UPDATE permissions SET
      can_create=$1,
      can_view=$2,
      can_update=$3,
      can_delete=$4
    WHERE user_id=$5 AND module_id=$6
  `;

    await db.query(query, [
      permissions.create,
      permissions.view,
      permissions.update,
      permissions.delete,
      userId,
      module_id
    ]);
  }




};

module.exports = { dbModel };
