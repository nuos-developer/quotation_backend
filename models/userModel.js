const { pool } = require('../config/dbConn');

const userModel = {

    updateLoginStatus: async (userId) => {
        try {
            const query = `UPDATE users SET is_login = true WHERE id = $1`;
            const result = await pool.query(query, [userId]);

            if (result.rowCount === 0) {
                logger.warn(`No user found with id ${userId}`);
                return null;
            }

            return result.rows[0]; // returns updated user id and login status
        } catch (error) {
            logger.error('Error updating login status:', error);
            throw error; // rethrow if you want to handle it higher
        }
    },

    // Set is_login_after_approval = 1 after admin approval
    updateLoginAfterApproval: async (userId) => {
        const query = `UPDATE users SET is_login_after_approval = true WHERE id = $1 RETURNING id, is_login_after_approval`;
        const result = await pool.query(query, [userId]);
        return result.rows[0];
    },

    insertUserData: async (userId, userData) => {
        try {
            const {
                partner_id,
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
            } = userData;

            const query = `
        INSERT INTO users_details (user_id, partner_id, address, pin_code, country, state, district,taluk, division, region, company_name, gst_name, company_address, created_by)VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)RETURNING *;
      `;
            const values = [
                userId,
                partner_id,
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
                company_address,
                userId
            ];

            const result = await pool.query(query, values);

            return {
                success: true,
                message: 'User details inserted successfully',
                data: result.rows[0],
            };

        } catch (error) {
            console.error('Error inserting user details:', error);
            return {
                success: false,
                message: 'Failed to insert user details "db.insertUserData"',
                error: error.message,
            };
        }
    },

    getUserInfo: async (userId) => {
        try {
            const result = await pool.query(
                `SELECT 
                    u.id AS user_id, u.first_name, u.last_name, u.email_id, u.mobile_number, ud.id AS user_details_id, ud.address, ud.pin_code, ud.country, ud.state, ud.district, ud.taluk, ud.division, ud.region, ud.company_name, ud.company_address, ud.gst_name, p.id AS partner_id, p.partner_name
            FROM users u
            LEFT JOIN users_details ud ON ud.user_id = u.id
            LEFT JOIN partners p ON p.id = ud.partner_id
            WHERE u.id = $1 AND u.deleted_by IS NULL`, [userId]);

            if (!result.rows.length) {
                return {
                    success: false,
                    message: 'User data found',
                    data: null,
                };
            }
            return {
                success: true,
                message: 'User info fatch successfully',
                data: result.rows[0],
            };
        } catch (error) {
            console.error('Error fetching user info:', error);
            return {
                success: false,
                message: 'Failed to fetch user info',
                error: error.message,
            };
        }
    },

    checkApprovalStatus: async (emailId) => {
        try {
            const result = await pool.query(
                `
      SELECT is_admin_approve
      FROM users
      WHERE email_id = $1
        AND deleted_at IS NULL
      `,
                [emailId]
            );

            return result.rows[0]?.is_admin_approve;
        } catch (error) {
            console.error('Error checking approval status:', error);
            throw error;
        }
    },


    updateUserData: async (userId, userData) => {
        try {
            const { partner_id, address, pin_code, country, state, district, taluk, division, region, company_name, gst_name, company_address, updated_by } = userData;
            const query =
                `UPDATE users_details
                     SET address = $1, pin_code = $2, country = $3, state = $4, district = $5, taluk = $6, division = $7, region = $8, company_name = $9, gst_name = $10, company_address = $11, updated_by = $12, updated_at = NOW()
                     WHERE user_id = $13;`;

            const values = [
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
                company_address,
                updated_by,
                userId
            ];

            console.log('values :>>>>>>', values);

            const result = await pool.query(query, values);

            return {
                success: true,
                data: result.rows[0],
            };

        } catch (error) {
            console.error('Error updating user details:', error);
            return {
                success: false,
                message: 'Failed to update user details',
                error: error.message,
            };
        }
    },

    getPermissionUsers: async (loggedInUserId) => {
        try {
            const query = `
                    WITH RECURSIVE partner_tree AS (
                          SELECT id, partner_type, parent_partner_id
                          FROM partners
                          WHERE id = (
                            SELECT partner_type_id
                            FROM user_role_mapping
                            WHERE user_id = $1
                          )
                          UNION ALL
                          SELECT p.id, p.partner_type, p.parent_partner_id
                          FROM partners p
                          INNER JOIN partner_tree pt ON p.parent_partner_id = pt.id
                      )
                      SELECT 
                          u.id AS user_id,
                          u.first_name,
                          u.last_name , ud.pin_code  , ud.address ,ud.address ,ud.country , ud.state , ud.division ,ud.district ,ud.company_address ,ud.company_name ,ud.company_address ,ud.gst_name,
                          u.user_name ,
                          u.email_id ,
                          p.partner_type,
                          c.continents_name,
                          co.country_name,
                          z.zone_name,
                          s.state_name,
                          d.dist_name
                      FROM user_role_mapping urm
                      JOIN users u ON u.id = urm.user_id
                      JOIN partners p ON p.id = urm.partner_type_id
                      LEFT JOIN continents c ON c.id = urm.continent_id
                      LEFT JOIN countries co ON co.id = urm.country_id
                      LEFT JOIN zones z ON z.id = urm.zone_id
                      LEFT JOIN states s ON s.id = urm.state_id
                      LEFT JOIN districts d ON d.id = urm.city_id
                      left join users_details ud on ud.user_id  = u.id 
                      WHERE urm.partner_type_id IN (
                          SELECT id FROM partner_tree WHERE id != (
                            SELECT partner_type_id FROM user_role_mapping WHERE user_id = $1
                          )
                      )
                      AND urm.deleted_by IS NULL`;

            const result = await pool.query(query, [loggedInUserId]);

            if (!result.rows.length) {
                return {
                    success: false,
                    message: 'No users found under this partner',
                    data: [],
                };
            }

            return {
                success: true,
                message: 'Accessible users fetched successfully',
                data: result.rows,
            }
        } catch (error) {
            console.error('DB Error (getPermissionUsers):', error);
            return {
                success: false,
                message: 'Database query failed',
                error: error.message,
            };
        }
    },


    getPermissionByuserId: async (userId) => {
        try {
            const query = `SELECT p.id , m.id "module_id", m.module_name , r.id "role_id" , r.role_name, u.id "user_id", u.user_name, p.can_create ,p.can_delete ,p.can_update ,p.can_view,p.assigned_by, p.created_at , p.updated_at 
                            FROM permissions p 
                            JOIN modules m ON p.module_id = m.id 
                            JOIN roles r  ON p.role_id  = r.id 
                            JOIN users u ON p.user_id = u.id 
                            WHERE user_Id = $1
                            `

            const result = await pool.query(query, [userId]);

            if (!result.rows.length) {
                return {
                    success: false,
                    message: 'No users permission found under this partner',
                    data: [],
                };
            }

            return {
                success: true,
                message: 'Users Permission fetched successfully',
                data: result.rows,
            }
        } catch (error) {
            console.error('DB Error (getPermissionUsers):', error);
            return {
                success: false,
                message: 'Database query failed',
                error: error.message,
            };
        }
    },


    createClient: async (userId, data) => {
        const client = await pool.connect();

        try {
            await client.query('BEGIN');

            // 🔥 STEP 1: CHECK duplicate email/mobile
            const checkQuery = `
      SELECT 1 FROM clients 
      WHERE email_id = $1 OR mobile_number = $2
      LIMIT 1;
    `;

            const checkRes = await client.query(checkQuery, [
                data.email_id,
                data.mobile_number
            ]);

            if (checkRes.rows.length > 0) {
                throw { code: 'DUPLICATE' };
            }

            // 🔥 STEP 2: GET LAST client_id
            const lastClientQuery = `
      SELECT client_id 
      FROM clients 
      WHERE user_id = $1 
      ORDER BY id DESC 
      LIMIT 1
      FOR UPDATE;
    `;

            const lastResult = await client.query(lastClientQuery, [userId]);

            let nextNumber = 1;

            if (lastResult.rows.length > 0) {
                const lastClientId = lastResult.rows[0].client_id;

                const match = lastClientId.match(/(\d+)$/);
                if (match) {
                    nextNumber = parseInt(match[0]) + 1;
                }
            }

            // 🔥 STEP 3: GENERATE client_id
            const client_id = `CL0${userId}${nextNumber}`;
            console.log(client_id);


            // 🔥 STEP 4: INSERT (HANDLE OPTIONAL FIELDS)
            const query = `
      INSERT INTO clients (
        user_id,
        client_id,
        first_name,
        last_name,
        mobile_number,
        email_id,
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
      VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17
      )
      RETURNING *;
    `;

            const values = [
                userId,
                client_id,
                data.first_name,
                data.last_name,
                data.mobile_number,
                data.email_id,
                data.address,
                data.pin_code,
                data.country,
                data.state,
                data.district,

                // 🔥 OPTIONAL FIELDS SAFE
                data.taluk || null,
                data.division || null,
                data.region || null,
                data.company_name || null,
                data.gst_name || null,
                data.company_address || null
            ];
            console.log(values);

            const result = await client.query(query, values);

            await client.query('COMMIT');

            return result.rows[0];

        } catch (error) {
            console.log(error);
            await client.query('ROLLBACK');

            throw error;
        } finally {
            client.release();
        }
    },

    updateClient: async (userId, clientId, data) => {

        const client = await pool.connect();

        try {
            await client.query('BEGIN');

      

            // 🔥 UPDATE QUERY
            const query = `
      UPDATE clients SET
        first_name = $1,
        last_name = $2,
        mobile_number = $3,
        email_id = $4,
        address = $5,
        pin_code = $6,
        country = $7,
        state = $8,
        district = $9,
        taluk = $10,
        division = $11,
        region = $12,
        company_name = $13,
        gst_name = $14,
        company_address = $15,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $16
      RETURNING *;
    `;

            const values = [
                data.first_name,
                data.last_name,
                data.mobile_number,
                data.email_id,
                data.address,
                data.pin_code,
                data.country,
                data.state,
                data.district,
                data.taluk || null,
                data.division || null,
                data.region || null,
                data.company_name || null,
                data.gst_name || null,
                data.company_address || null,
                clientId
            ];

            const result = await client.query(query, values);

            await client.query('COMMIT');

            return result.rows[0];

        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    },

    deleteClient : async (clientId, userId) => {
  const query = `
    UPDATE clients
    SET 
      
      deleted_at = CURRENT_TIMESTAMP,
      deleted_by = $1
    WHERE id = $2
    RETURNING *;
  `;

  const result = await pool.query(query, [userId, clientId]);

  return result.rows[0];
},



}


module.exports = { userModel }