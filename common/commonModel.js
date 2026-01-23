const { pool } = require('../config/dbConn');


const commDbModel = {

    findByEmail: async (email_id) => {
        try {
            const result = await pool.query(
                `SELECT u.id, u.email_id, r.id "role_id", r."level", u.password
                FROM users u
                join roles r on r.id = u.role_id
                WHERE email_id = $1 AND deleted_at IS NULL`,
                [email_id]
            );
            return result.rows[0];
        } catch (error) {
            console.error('Error finding admin by email:', error);
            throw error;
        }
    },

    _getPartners: async () => {
        try {
            const result = await pool.query(
                `SELECT p.id, p.partner_name FROM partners p ORDER BY p.id ASC;`
            );
            return result.rows;
        } catch (error) {
            console.error('DB Error (_getPartners):', error);
            throw error;
        }
    },
    _getModules: async () => {
        try {
            const result = await pool.query(
                `SELECT id, module_name  FROM modules WHERE parent_module_id IS NULL ORDER BY id ASC;`
            );
            return result.rows;
        } catch (error) {
            console.error('DB Error (_getModules):', error);
            throw error;
        }
    },

    _getRoles: async () => {
        try {
            const result = await pool.query(
                `SELECT id, role_name, role_key FROM roles WHERE parent_role_id < level ORDER BY id ASC;`
            );
            return result.rows;
        } catch (error) {
            console.error('DB Error (_getRoles):', error);
            throw error;
        }
    },

    _getContinents: async () => {
        try {
            const result = await pool.query(
                `select cont.id, cont.continents_name from continents cont where cont.is_active = true order by cont.continents_name asc;`
            );
            return result.rows;
        } catch (error) {
            console.error('DB Error (_getContinents):', error);
            throw error;
        }
    },
    _getCountries: async (continentId) => {
        try {
            const result = await pool.query(
                `select c.id ,c.country_name 
                from  countries c 
                join continents c2 on c.continent_id = c2.id 
                where c.continent_id = $1 order by c.continent_id asc;`, [continentId]
            );
            return result.rows;
        } catch (error) {
            console.error('DB Error (_getCountries):', error);
            throw error;
        }
    },

    _getZone: async (countryId) => {
        try {
            const result = await pool.query(
                `select z.id , z.zone_name
                 from zones z
                 join countries c on c.id = z.country_id 
                 where z.country_id = $1 order by z.zone_name asc`, [countryId]
            );
            return result.rows;
        } catch (error) {
            console.error('DB Error (_getZone):', error);
            throw error;
        }
    },
    _getStates: async (zoneId) => {
        try {
            const result = await pool.query(
                `select s.id , s.state_name  from state_zones sz 
                 join states s on sz.state_id = s.id
                 where sz.zone_id = $1 order by s.state_name asc
                 `, [zoneId]
            );
            return result.rows;
        } catch (error) {
            console.error('DB Error (_getStates):', error);
            throw error;
        }
    },

    _getCities: async (stateId) => {
        try {
            const result = await pool.query(
                `select d.id , d.dist_name  from districts d 
                 join states s on s.id = d.state_id 
                 where d.state_id =$1 order by d.dist_name asc`, [stateId]
            );
            return result.rows;
        } catch (error) {
            console.error('DB Error (_getCities):', error);
            throw error;
        }
    },

    _getChannels: async () => {
        try {
            const result = await pool.query(
                `SELECT c.id, c.channel_name FROM channels c where c.is_active = true ORDER BY c.id ASC;`
            );
            return result.rows;
        } catch (error) {
            console.error('DB Error (_getChannels):', error);
            throw error;
        }
    },
    checkUserId: async (userId) => {
        try {
            const result = await pool.query(
                `SELECT u.id AS user_id, u.email_id, u.mobile_number, u.first_name, u.last_name,
                       ud.id AS user_details_id
                FROM users u
                LEFT JOIN users_details ud ON ud.user_id = u.id
                WHERE u.id = $1 AND u.deleted_by IS NULL;`,
                [userId]
            );
            return result.rows[0] || null; // Return single record or null
        } catch (error) {
            console.error('DB Error (checkUserId):', error);
            throw error;
        }
    },

    saveOtp: async (hashedOtp) => {
        try {
            const query = `
                INSERT INTO otps (otp_hash, created_at, expires_at)
                VALUES ($1, NOW(), NOW() + INTERVAL '1 minute')
                ON CONFLICT (user_id)
                DO UPDATE SET otp_hash = EXCLUDED.otp_hash, created_at = NOW(), expires_at = NOW() + INTERVAL '1 minute'
                RETURNING *;`;

            const result = await pool.query(query, [hashedOtp]);
            return result.rows[0]; // returns the inserted/updated OTP record
        } catch (error) {
            console.error('Error saving OTP:', error);
            throw error;
        }
    },

    getOtp: async (otpId) => {
        try {

            const result = await pool.query(
                `SELECT id, otp_hash, expires_at FROM otps WHERE id = $1`,
                [otpId]
            );
            return result.rows[0];
        } catch (error) {
            console.error('Error saving OTP:', error);
            throw error;
        }
    },

    updateOtpStatus: async (userId) => {
        try {
            const query = `
                UPDATE users 
                SET is_varify = true, updated_at = NOW()
                WHERE id = $1
        `;
            const result = await pool.query(query, [userId]);

            if (!result.rows.length) {
                return { success: false, message: 'User not found or update failed.' };
            }
            console.log(' data: result.rows[0], .>>>>>>>>>>', result.rows[0],);


            return {
                success: true,
                message: 'OTP verified successfully!',
                data: result.rows[0],
            };

        } catch (error) {
            console.error('Error updating OTP status:', error);
            return {
                success: false,
                message: 'Failed to update user verify status.',
                error: error.message,
            };
        }
    },

    changePassword: async (userId, hashedPassword, salt) => {
        try {
            const query = `
      UPDATE users
      SET password = $1,
          salt_password = $2,
          updated_at = NOW()
      WHERE id = $3
      RETURNING id
    `;

            const values = [hashedPassword, salt, userId];

            const result = await pool.query(query, values);

            if (result.rowCount === 0) {
                return null;
            }

            return result.rows[0];
        } catch (error) {
            console.error('DB Error (changePassword):', error);
            throw error;
        }
    },



}

module.exports = { commDbModel }