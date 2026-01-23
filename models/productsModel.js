
const { pool } = require('../config/dbConn');

const productModel = {
    addProduct: async (reqBody, userId) => {
        try {
            const {
                product_name,
                category,
                mod_size,
                price,
                wiring_type_id,
                wiring_type,
                zigbee_type,
            } = reqBody;

            const query = `
            INSERT INTO products 
            (user_id, product_name, category, mod_size, price, wiring_type_id, wiring_type, zigbee_type, created_by)
            VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
            RETURNING id;
        `;

            const values = [
                userId,
                product_name,
                category,
                mod_size,
                price,
                wiring_type_id,
                wiring_type,
                zigbee_type,
                userId
            ];

            const result = await pool.query(query, values);
            return result.rows[0];

        } catch (error) {
            console.error("Error inserting product:", error);
            throw error;
        }
    },

    addProductImages: async (productId, imageUrls) => {
        try {
            const query = `
            INSERT INTO product_images (product_id, image_url)
            VALUES ($1, $2)
        `;

            for (const url of imageUrls) {
                await pool.query(query, [productId, url]);
            }
            return true;
        } catch (error) {
            console.error("Error inserting product images:", error);
            throw error;
        }
    },

    getProductBypId: async (productId) => {
        try {
            const result = await pool.query(
                `SELECT p.id,p.product_name,
                     p.category,
                     p.mod_size,
                     p.price,
                     p.wiring_type_id,
                     p.wiring_type,
                     p.zigbee_type,
                     p.created_at
                     from products p 
                 WHERE p.id = $1 and p.deleted_at IS NULL`, [productId]);

            if (!result.rows.length) {
                return {
                    success: false,
                    message: 'Product data found',
                    data: null,
                };
            }
            return {
                success: true,
                message: 'Product info fatch successfully',
                data: result.rows[0],
            };
        } catch (error) {
            console.error('Error fetching Product info:', error);
            return {
                success: false,
                message: 'Failed to fetch Product info',
                error: error.message,
            };
        }
    },

    getProduct: async () => {
        try {
            const result = await pool.query(
                `SELECT p.id,
                     p.product_name,
                     p.category,
                     p.mod_size,
                     p.price,
                     wt.id AS wiring_type_id,
                    -- wt.wiring_type_id ,
                     wt.wiring_type,
                     p.zigbee_type,
                     p.created_at,
                     ARRAY_AGG(t.image_url) AS image_urls
                 FROM products p
                 INNER JOIN wiring_type wt  
                     ON p.wiring_type_id = wt.id
                 LEFT JOIN product_images t 
                     ON t.product_id = p.id 
                     AND t.is_active = true
                 WHERE p.is_active  = true
                 GROUP BY 
                     p.id,
                     p.product_name,
                     p.category,
                     p.mod_size,
                     p.price,
                     wt.id,
                     wt.wiring_type,
                     p.zigbee_type,
                     p.created_at; `
            );

            if (!result.rows.length) {
                return {
                    success: false,
                    message: 'Product data found',
                    data: null,
                };
            }
            return {
                success: true,
                message: 'Product data fatch successfully',
                data: result.rows,
            };
        } catch (error) {
            console.error('Error fetching Product info:', error);
            return {
                success: false,
                message: 'Failed to fetch Product Data',
                error: error.message,
            };
        }
    },
    getInactiveProduct: async () => {
        try {
            const result = await pool.query(
                `SELECT p.id,
                     p.product_name,
                     p.category,
                     p.mod_size,
                     p.price,
                     wt.id AS wiring_type_id,
                    -- wt.wiring_type_id ,
                     wt.wiring_type,
                     p.zigbee_type,
                     p.created_at,
                     ARRAY_AGG(t.image_url) AS image_urls
                 FROM products p
                 INNER JOIN wiring_type wt  
                     ON p.wiring_type_id = wt.id
                 LEFT JOIN product_images t 
                     ON t.product_id = p.id 
                     AND t.is_active = true
                 WHERE p.is_active  = false
                 GROUP BY 
                     p.id,
                     p.product_name,
                     p.category,
                     p.mod_size,
                     p.price,
                     wt.id,
                     wt.wiring_type,
                     p.zigbee_type,
                     p.created_at;  `
            );

            if (!result.rows.length) {
                return {
                    success: false,
                    message: 'Product data found',
                    data: null,
                };
            }
            return {
                success: true,
                message: 'Product data fatch successfully',
                data: result.rows,
            };
        } catch (error) {
            console.error('Error fetching Product info:', error);
            return {
                success: false,
                message: 'Failed to fetch Product Data',
                error: error.message,
            };
        }
    },
    
    getWireType: async () => {
        try {
            const result = await pool.query(
                `SELECT id, wiring_name FROM wiring_type ; `
            );

            if (!result.rows.length) {
                return {
                    success: false,
                    message: 'wire data found',
                    data: null,
                };
            }
            return {
                success: true,
                message: 'wire data fatch successfully',
                data: result.rows,
            };
        } catch (error) {
            console.error('Error fetching wire info:', error);
            return {
                success: false,
                message: 'Failed to fetch wire Data',
                error: error.message,
            };
        }
    },

    updateProduct: async (productId, reqBody, userId) => {
        try {
            const {
                product_name,
                category,
                mod_size,
                price,
                wiring_type_id,
                wiring_type,
                zigbee_type
            } = reqBody;

            const query = `
            UPDATE products p
            SET 
                product_name = $1,
                category = $2,
                mod_size = $3,
                price = $4,
                wiring_type_id = $5,
                wiring_type = $6,
                zigbee_type = $7,
                updated_by = $8,
                updated_at = NOW()
            WHERE p.id = $9
            RETURNING *;
        `;

            const values = [
                product_name,
                category,
                mod_size,
                price,
                wiring_type_id,
                wiring_type,
                zigbee_type,
                userId,
                productId
            ];

            const result = await pool.query(query, values);

            return {
                success: true,
                data: result.rows[0],
            };

        } catch (error) {
            console.error('Error updating Product details:', error);
            return {
                success: false,
                message: 'Failed to update Product details',
                error: error.message,
            };
        }
    },
    updateProduct: async (productId, reqBody, userId) => {
        try {
            const {
                product_name,
                category,
                mod_size,
                price,
                wiring_type_id,
                wiring_type,
                zigbee_type
            } = reqBody;

            const query = `
            UPDATE products p
            SET 
                product_name = $1,
                category = $2,
                mod_size = $3,
                price = $4,
                wiring_type_id = $5,
                wiring_type = $6,
                zigbee_type = $7,
                updated_by = $8,
                updated_at = NOW()
            WHERE p.id = $9
            RETURNING *;
        `;
            const values = [
                product_name,
                category,
                mod_size,
                price,
                wiring_type_id,
                wiring_type,
                zigbee_type,
                userId,
                productId
            ];

            const result = await pool.query(query, values);

            return {
                success: true,
                data: result.rows[0],
            };

        } catch (error) {
            console.error('Error updating Product details:', error);
            return {
                success: false,
                message: 'Failed to update Product details',
                error: error.message,
            };
        }
    },

    deleteProductById: async (productId, userId) => {
        try {
            const query = `
            UPDATE products p
            SET 
                is_active = false,
                deleted_at = NOW()
            WHERE p.id = $1
            RETURNING *;`;

            const result = await pool.query(query, [ productId]);

            return {
                success: true,
                data: result.rows[0],
            };
        } catch (error) {
            console.error('Error updating Product details:', error);
            return {
                success: false,
                message: 'Failed to update Product details',
                error: error.message,
            };
        }
    },
    activeProduct: async (productId, userId) => {
        try {
            const query = `
            UPDATE products p
            SET 
                is_active = true,
                deleted_at = NOW()
            WHERE p.id = $1
            RETURNING *;`;

            const result = await pool.query(query, [ productId]);

            return {
                success: true,
                data: result.rows[0],
            };
        } catch (error) {
            console.error('Error updating Product details:', error);
            return {
                success: false,
                message: 'Failed to update Product details',
                error: error.message,
            };
        }
    },

    deleteProposalById: async (productId, userId) => {
        try {
            const query = `
            UPDATE proposals p
            SET 
                deleted_by = $1,
                deleted_at = NOW()
            WHERE p.id = $2
            RETURNING *;`;

            const result = await pool.query(query, [userId, productId]);

            return {
                success: true,
                data: result.rows[0],
            };

        } catch (error) {
            console.error('Error updating Product details:', error);
            return {
                success: false,
                message: 'Failed to update Product details',
                error: error.message,
            };
        }
    },

    checkProductById: async (productIds) => {
        try {
            const result = await pool.query(
                `select * 
                from products p
               WHERE id = ANY($1)`, [productIds]
            );

            if (!result.rows.length) {
                return {
                    success: false,
                    message: 'Product data found',
                    data: null,
                };
            }
            return {
                success: true,
            };
        } catch (error) {
            console.error('Error fetching Product info:', error);
            return {
                success: false,
                message: 'Failed to fetch Product Data',
                error: error.message,
            };
        }
    },

    createProposal: async (reqBody, userId) => {
        try {
            const {
                client_id,
                proposal_id,
                commissioning_percentage,
                discount_percentage,
                financial_breakdown,
                floor,
                grand_total,
                installation_percentage,
                products_wise_items
            } = reqBody;

            const query = `
      INSERT INTO proposals (
        client_id,
        proposal_id,
        commissioning_percentage,
        discount_percentage,
        financial_breakdown,
        floor,
        grand_total,
        installation_percentage,
        products_wise_items,
        created_by
      )
      VALUES (
        $1, $2, $3, $4,
        $5::jsonb,
        $6::jsonb,
        $7,
        $8,
        $9::jsonb,
        $10
      )
      RETURNING *;
    `;

            const values = [
                client_id,
                proposal_id,
                commissioning_percentage,
                discount_percentage,
                JSON.stringify(financial_breakdown), // REQUIRED
                JSON.stringify(floor),               // REQUIRED
                grand_total,
                installation_percentage,
                JSON.stringify(products_wise_items), // REQUIRED
                userId
            ];

            return (await pool.query(query, values)).rows[0];

        } catch (err) {
            console.error('Error inserting proposal:', err);
            throw err;
        }
    },

    getProposalData: async (userId) => {
        try {

            const result = await pool.query(
                `SELECT
    p.id,
    p.proposal_id,
    floors.floor,
    p.commissioning_percentage,
    p.discount_percentage,
    p.financial_breakdown,
    p.grand_total,
    p.installation_percentage,
    p.products_wise_items,
    p.client_id,

    jsonb_build_object(
        'id', u.id,
        'first_name', u.first_name,
        'last_name', u.last_name,
        'address', ud.address,
        'pin_code', ud.pin_code,
        'country', ud.country,
        'state', ud.state,
        'district', ud.district,
        'taluk', ud.taluk,
        'division', ud.division,
        'region', ud.region,
        'company_name', ud.company_name,
        'gst_name', ud.gst_name,
        'company_address', ud.company_address,
        'userName', u.user_name,
        'email', u.email_id,
        'phone', u.mobile_number,
        'role', u.role_name
    ) AS user_details

FROM proposals p

/* ---------- FLOOR JSON (SAFE ARRAY HANDLING) ---------- */
LEFT JOIN LATERAL (
    SELECT jsonb_agg(
        jsonb_build_object(
            'name', fl->>'name',
            'homes',
            (
                SELECT jsonb_agg(
                    jsonb_build_object(
                        'name', hm->>'name',
                        'rooms',
                        (
                            SELECT jsonb_agg(
                                jsonb_build_object(
                                    'name', rm->>'name',
                                    'switchboards',
                                    (
                                        SELECT jsonb_agg(
                                            jsonb_build_object(
                                                'name', sb->>'name',
                                                'mod', sb->'mod',
                                                'colorValue', sb->'colorValue',
                                                'products',
                                                COALESCE(
                                                    (
                                                        SELECT jsonb_agg(
                                                            jsonb_build_object(
                                                                'id', pr.id,
                                                                'name', pr.product_name,
                                                                'category', pr.category,
                                                                'price', pr.price,
                                                                'modSize', pr.mod_size,
                                                                'wiringTypeId', pr.wiring_type_id,
                                                                'zigbeeType', pr.zigbee_type,
                                                                'imagePath', pi.image_url
                                                            )
                                                            ORDER BY pid.ordinality
                                                        )
                                                        FROM jsonb_array_elements_text(
                                                            CASE
                                                              WHEN jsonb_typeof(sb->'products') = 'array'
                                                              THEN sb->'products'
                                                              ELSE '[]'::jsonb
                                                            END
                                                        ) WITH ORDINALITY AS pid(pid, ordinality)
                                                        JOIN products pr
                                                          ON pr.id = pid.pid::int
                                                        LEFT JOIN product_images pi
                                                          ON pi.product_id = pr.id
                                                         AND pi.is_active = true
                                                    ),
                                                    '[]'::jsonb
                                                )
                                            )
                                        )
                                        FROM jsonb_array_elements(
                                            CASE
                                              WHEN jsonb_typeof(rm->'switchboards') = 'array'
                                              THEN rm->'switchboards'
                                              ELSE '[]'::jsonb
                                            END
                                        ) sb
                                    )
                                )
                            )
                            FROM jsonb_array_elements(
                                CASE
                                  WHEN jsonb_typeof(hm->'rooms') = 'array'
                                  THEN hm->'rooms'
                                  ELSE '[]'::jsonb
                                END
                            ) rm
                        )
                    )
                )
                FROM jsonb_array_elements(
                    CASE
                      WHEN jsonb_typeof(fl->'homes') = 'array'
                      THEN fl->'homes'
                      ELSE '[]'::jsonb
                    END
                ) hm
            )
        )
    ) AS floor
    FROM jsonb_array_elements(
        CASE
          WHEN jsonb_typeof(p.floor) = 'array'
          THEN p.floor
          ELSE '[]'::jsonb
        END
    ) fl
) floors ON TRUE

LEFT JOIN users u
  ON u.id = p.client_id

LEFT JOIN users_details ud
  ON ud.user_id = u.id

WHERE p.deleted_at IS NULL;
;
`);

            if (!result.rows.length) {
                return {
                    success: false,
                    message: 'Proposal data not found',
                    data: null,
                };
            }
            return {
                success: true,
                message: 'Proposal fatch successfully',
                data: result.rows,
            };
        } catch (error) {
            console.error("Error inserting proposal:", error);
            throw error;
        }
    },
    getProposalDataById: async (proposalId, userId) => {
        try {

            const result = await pool.query(
                `SELECT
                        p.id,
                        p.proposal_id,
                        floors.floor,
                        p.commissioning_percentage,
                        p.discount_percentage,
                        p.financial_breakdown,
                        p.grand_total,
                        p.installation_percentage,
                        p.products_wise_items,
                        p.client_id,
                                
                        jsonb_build_object(
                            'id', u.id,
                            'first_name', u.first_name,
                            'last_name', u.last_name,
                            'address', ud.address,
                            'pin_code', ud.pin_code,
                            'country', ud.country,
                            'state', ud.state,
                            'district', ud.district,
                            'taluk', ud.taluk,
                            'division', ud.division,
                            'region', ud.region,
                            'company_name', ud.company_name,
                            'gst_name', ud.gst_name,
                            'company_address', ud.company_address,
                            'userName', u.user_name,
                            'email', u.email_id,
                            'phone', u.mobile_number,
                            'role', u.role_name
                        ) AS user_details
                                
                FROM proposals p
                                
                    /* ---------- FLOOR JSON (SAFE ARRAY HANDLING) ---------- */
                    LEFT JOIN LATERAL (
                        SELECT jsonb_agg(
                            jsonb_build_object(
                                'name', fl->>'name',
                                'homes',
                                (
                                    SELECT jsonb_agg(
                                        jsonb_build_object(
                                            'name', hm->>'name',
                                            'rooms',
                                            (
                                                SELECT jsonb_agg(
                                                    jsonb_build_object(
                                                        'name', rm->>'name',
                                                        'switchboards',
                                                        (
                                                            SELECT jsonb_agg(
                                                                jsonb_build_object(
                                                                    'name', sb->>'name',
                                                                    'mod', sb->'mod',
                                                                    'colorValue', sb->'colorValue',
                                                                    'products',
                                                                    COALESCE(
                                                                        (
                                                                            SELECT jsonb_agg(
                                                                                jsonb_build_object(
                                                                                    'id', pr.id,
                                                                                    'name', pr.product_name,
                                                                                    'category', pr.category,
                                                                                    'price', pr.price,
                                                                                    'modSize', pr.mod_size,
                                                                                    'wiringTypeId', pr.wiring_type_id,
                                                                                    'zigbeeType', pr.zigbee_type,
                                                                                    'imagePath', pi.image_url
                                                                                )
                                                                                ORDER BY pid.ordinality
                                                                            )
                                                                            FROM jsonb_array_elements_text(
                                                                                CASE
                                                                                  WHEN jsonb_typeof(sb->'products') = 'array'
                                                                                  THEN sb->'products'
                                                                                  ELSE '[]'::jsonb
                                                                                END
                                                                            ) WITH ORDINALITY AS pid(pid, ordinality)
                                                                            JOIN products pr
                                                                              ON pr.id = pid.pid::int
                                                                            LEFT JOIN product_images pi
                                                                              ON pi.product_id = pr.id
                                                                             AND pi.is_active = true
                                                                        ),
                                                                        '[]'::jsonb
                                                                    )
                                                                )
                                                            )
                                                            FROM jsonb_array_elements(
                                                                CASE
                                                                  WHEN jsonb_typeof(rm->'switchboards') = 'array'
                                                                  THEN rm->'switchboards'
                                                                  ELSE '[]'::jsonb
                                                                END
                                                            ) sb
                                                        )
                                                    )
                                                )
                                                FROM jsonb_array_elements(
                                                    CASE
                                                      WHEN jsonb_typeof(hm->'rooms') = 'array'
                                                      THEN hm->'rooms'
                                                      ELSE '[]'::jsonb
                                                    END
                                                ) rm
                                            )
                                        )
                                    )
                                    FROM jsonb_array_elements(
                                        CASE
                                          WHEN jsonb_typeof(fl->'homes') = 'array'
                                          THEN fl->'homes'
                                          ELSE '[]'::jsonb
                                        END
                                    ) hm
                                )
                            )
                        ) AS floor
                        FROM jsonb_array_elements(
                            CASE
                              WHEN jsonb_typeof(p.floor) = 'array'
                              THEN p.floor
                              ELSE '[]'::jsonb
                            END
                        ) fl
                    ) floors ON TRUE
                                
                    LEFT JOIN users u
                      ON u.id = p.client_id
                                
                    LEFT JOIN users_details ud
                      ON ud.user_id = u.id
                                
                    WHERE p.id = $1
                      AND p.deleted_at IS NULL;
                     ;
                        ;`, [proposalId]);

            if (!result.rows.length) {
                return {
                    success: false,
                    message: 'Proposal data not found "getProposalDataById"',
                    data: null,
                };
            }
            return {
                success: true,
                message: 'Proposal fatch successfully',
                data: result.rows,
            };
        } catch (error) {
            console.error("Error inserting proposal:", error);
            throw error;
        }
    }
}

module.exports = { productModel }