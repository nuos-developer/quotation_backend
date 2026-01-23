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

            return result.rows[0]?.is_admin_approve || null;
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


    getUserDashboard: async () => {
        try {
            const query = ``

            const result = await pool.query(query, [loggedInUserId]);

            if (!result.rows.length) {
                return {
                    success: false,
                    message: 'No users dashboard found under this partner',
                    data: [],
                };
            }

            return {
                success: true,
                message: 'Users Dashboard fetched successfully',
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
    }
}


module.exports = { userModel }