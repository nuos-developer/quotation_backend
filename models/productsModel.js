
const { pool } = require('../config/dbConn');

const productModel = {
    addProduct: async (reqBody, userId) => {
        try {
            const {
                product_name,
                category,
                mod_size,
                price,
                wiring_type,
                zigbee_type,
            } = reqBody;

            // ✅ convert wiring_type_id to integer
            // const wiring_type_id = parseInt(reqBody.wiring_type_id, 10);

            // // ✅ validate integer
            // if (!Number.isInteger(wiring_type_id)) {
            //     throw new Error('wiring_type_id must be a valid integer');
            // }

            const query = `
      INSERT INTO products 
      (user_id, product_name, category, mod_size, price, wiring_type, zigbee_type, created_by)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
      RETURNING id;
    `;

            const values = [
                userId,
                product_name,
                category,
                mod_size,
                price,
                // wiring_type_id || null, // ✅ integer now
                wiring_type,
                zigbee_type,
                userId
            ];

            const result = await pool.query(query, values);
            return result.rows[0];

        } catch (error) {
            console.error("Error inserting product:", error.message);
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
                 INNER JOIN wiring_types wt  
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
                 INNER JOIN wiring_types wt  
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
                `SELECT id, wiring_name FROM wiring_types ; `
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

    deleteProductById: async (productId, userId) => {
        try {
            const query = `
            UPDATE products p
            SET 
                is_active = false,
                deleted_at = NOW()
            WHERE p.id = $1
            RETURNING *;`;

            const result = await pool.query(query, [productId]);

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

            const result = await pool.query(query, [productId]);

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
      products_wise_items,
      proposal_type,
      recipient_name,
      ship_to_address,
      use_same_address,
      use_same_recipient
    } = reqBody;

    console.log(':>>>>>>>>',reqBody);
    console.log(':>>>>>>>>',proposal_type);
    console.log(':>>>>>>>>',products_wise_items);
    console.log(':>>>>>>>>',floor);
    

    // 🔥 CONDITIONAL DATA HANDLING
    let floorData = null;
    let productsWiseData = null;

  
    if (proposal_type === 'structureWise') {
      floorData = JSON.stringify(floor || []);
      productsWiseData = null;
    } else if (proposal_type === 'productsWise') {
      floorData = null;
      productsWiseData = JSON.stringify(products_wise_items || []);
    } else {
      throw new Error('Invalid proposal_type');
    }
    
    const query = `
      INSERT INTO proposals(
        client_id,
        proposal_id,
        commissioning_percentage,
        discount_percentage,
        financial_breakdown,
        floor,
        grand_total,
        installation_percentage,
        products_wise_items,
        proposal_type,
        recipient_name,
        ship_to_address,
        use_same_address,
        use_same_recipient,
        created_by
      )
      VALUES (
        $1, $2, $3, $4,
        $5::jsonb,
        $6::jsonb,
        $7,
        $8,
        $9::jsonb,
        $10,
        $11,
        $12,
        $13,
        $14,
        $15
      )
      RETURNING *;
    `;

    const values = [
      client_id,
      proposal_id,
      commissioning_percentage,
      discount_percentage,
      JSON.stringify(financial_breakdown || {}),
      floorData,
      grand_total,
      installation_percentage,
      productsWiseData,
      proposal_type,
      recipient_name || null,
      ship_to_address || null,
      use_same_address ?? false,
      use_same_recipient ?? false,
      userId
    ];
console.log('11111111111111',values);

    const result = await pool.query(query, values);
    return result.rows[0];

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
    p.proposal_type,
    p.created_at,
    p.updated_at,

    /* ================= STRUCTURE ================= */
    floors.floor,

    /* ================= PRODUCTS WISE ================= */
    CASE 
      WHEN p.proposal_type = 'productsWise' THEN pw.products_list
      ELSE NULL
    END AS products_wise_items,

    p.commissioning_percentage,
    p.discount_percentage,
    p.financial_breakdown,
    p.grand_total,
    p.installation_percentage,

    /* ================= CLIENT ================= */
    jsonb_build_object(
        'client_id', c.client_id,
        'first_name', c.first_name,
        'last_name', c.last_name,
        'email', c.email_id,
        'mobile', c.mobile_number
    ) AS client_details,

    /* ================= USER ================= */
    jsonb_build_object(
        'id', u.id,
        'user_name', u.user_name,
        'role', jsonb_build_object(
            'role_id', r.id,
            'role_name', r.role_name
        )
    ) AS created_by

FROM proposals p

/* =========================================================
   🔥 STRUCTURE (FLOOR → HOME → ROOM → SWITCHBOARD)
========================================================= */
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

                                    /* 🔥 ROOM PRODUCTS */
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
                                            'wiring_type_id', pr.wiring_type_id,
                                            'wiring_type', wt.wiring_name,
                                            'images', (
                                              SELECT jsonb_agg(pi.image_url)
                                              FROM product_images pi
                                              WHERE pi.product_id = pr.id
                                              AND pi.is_active = true
                                            )
                                          )
                                        )
                                        FROM jsonb_array_elements_text(
                                          COALESCE(rm->'products', '[]'::jsonb)
                                        ) pid
                                        JOIN products pr ON pr.id = pid::int
                                        LEFT JOIN wiring_types wt ON wt.id = pr.wiring_type_id
                                      ),
                                      '[]'::jsonb
                                    ),

                                    /* 🔥 SWITCHBOARDS */
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
                                                        'wiring_type_id', pr.wiring_type_id,
                                                        'wiring_type', wt.wiring_name,
                                                        'images', (
                                                          SELECT jsonb_agg(pi.image_url)
                                                          FROM product_images pi
                                                          WHERE pi.product_id = pr.id
                                                          AND pi.is_active = true
                                                        )
                                                      )
                                                    )
                                                    FROM jsonb_array_elements_text(
                                                      COALESCE(sb->'products', '[]'::jsonb)
                                                    ) pid
                                                    JOIN products pr ON pr.id = pid::int
                                                    LEFT JOIN wiring_types wt ON wt.id = pr.wiring_type_id
                                                  ),
                                                  '[]'::jsonb
                                                )
                                            )
                                        )
                                        FROM jsonb_array_elements(
                                            COALESCE(rm->'switchboards', '[]'::jsonb)
                                        ) sb
                                    )

                                )
                            )
                            FROM jsonb_array_elements(
                                COALESCE(hm->'rooms', '[]'::jsonb)
                            ) rm
                        )
                    )
                )
                FROM jsonb_array_elements(
                    COALESCE(fl->'homes', '[]'::jsonb)
                ) hm
            )
        )
    ) AS floor
    FROM jsonb_array_elements(
        COALESCE(p.floor, '[]'::jsonb)
    ) fl
) floors ON TRUE

/* =========================================================
   🔥 PRODUCTS WISE
========================================================= */
LEFT JOIN LATERAL (
    SELECT jsonb_agg(
        jsonb_build_object(
            'id', pr.id,
            'name', pr.product_name,
            'category', pr.category,
            'price', pr.price,
            'quantity', (item->>'quantity')::int,
            'wiring_type_id', pr.wiring_type_id,
            'wiring_type', wt.wiring_name,
            'images', (
                SELECT jsonb_agg(pi.image_url)
                FROM product_images pi
                WHERE pi.product_id = pr.id
                AND pi.is_active = true
            )
        )
    ) AS products_list
    FROM jsonb_array_elements(
        COALESCE(p.products_wise_items, '[]'::jsonb)
    ) item
    JOIN products pr ON pr.id = (item->>'id')::int
    LEFT JOIN wiring_types wt ON wt.id = pr.wiring_type_id
) pw ON TRUE

/* ================= JOINS ================= */
LEFT JOIN clients c ON c.id = p.client_id  
LEFT JOIN users u ON u.id = p.created_by    
LEFT JOIN roles r ON r.id = u.role_id  

/* ================= FILTER ================= */
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
    p.proposal_type,
    p.created_at,
    p.updated_at,

    /* ================= STRUCTURE ================= */
    floors.floor,

    /* ================= PRODUCTS WISE ================= */
    CASE 
      WHEN p.proposal_type = 'productsWise' THEN pw.products_list
      ELSE NULL
    END AS products_wise_items,

    p.commissioning_percentage,
    p.discount_percentage,
    p.financial_breakdown,
    p.grand_total,
    p.installation_percentage,

    /* ================= CLIENT ================= */
    jsonb_build_object(
        'client_id', c.client_id,
        'first_name', c.first_name,
        'last_name', c.last_name,
        'email', c.email_id,
        'mobile', c.mobile_number
    ) AS client_details,

    /* ================= USER ================= */
    jsonb_build_object(
        'id', u.id,
        'user_name', u.user_name,
        'role', jsonb_build_object(
            'role_id', r.id,
            'role_name', r.role_name
        )
    ) AS created_by

FROM proposals p

/* =========================================================
   🔥 STRUCTURE (FLOOR → HOME → ROOM → SWITCHBOARD)
========================================================= */
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

                                    /* 🔥 ROOM PRODUCTS */
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
                                            'wiring_type_id', pr.wiring_type_id,
                                            'wiring_type', wt.wiring_name,
                                            'images', (
                                              SELECT jsonb_agg(pi.image_url)
                                              FROM product_images pi
                                              WHERE pi.product_id = pr.id
                                              AND pi.is_active = true
                                            )
                                          )
                                        )
                                        FROM jsonb_array_elements_text(
                                          COALESCE(rm->'products', '[]'::jsonb)
                                        ) pid
                                        JOIN products pr ON pr.id = pid::int
                                        LEFT JOIN wiring_types wt ON wt.id = pr.wiring_type_id
                                      ),
                                      '[]'::jsonb
                                    ),

                                    /* 🔥 SWITCHBOARDS */
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
                                                        'wiring_type_id', pr.wiring_type_id,
                                                        'wiring_type', wt.wiring_name,
                                                        'images', (
                                                          SELECT jsonb_agg(pi.image_url)
                                                          FROM product_images pi
                                                          WHERE pi.product_id = pr.id
                                                          AND pi.is_active = true
                                                        )
                                                      )
                                                    )
                                                    FROM jsonb_array_elements_text(
                                                      COALESCE(sb->'products', '[]'::jsonb)
                                                    ) pid
                                                    JOIN products pr ON pr.id = pid::int
                                                    LEFT JOIN wiring_types wt ON wt.id = pr.wiring_type_id
                                                  ),
                                                  '[]'::jsonb
                                                )
                                            )
                                        )
                                        FROM jsonb_array_elements(
                                            COALESCE(rm->'switchboards', '[]'::jsonb)
                                        ) sb
                                    )

                                )
                            )
                            FROM jsonb_array_elements(
                                COALESCE(hm->'rooms', '[]'::jsonb)
                            ) rm
                        )
                    )
                )
                FROM jsonb_array_elements(
                    COALESCE(fl->'homes', '[]'::jsonb)
                ) hm
            )
        )
    ) AS floor
    FROM jsonb_array_elements(
        COALESCE(p.floor, '[]'::jsonb)
    ) fl
) floors ON TRUE

/* =========================================================
   🔥 PRODUCTS WISE
========================================================= */
LEFT JOIN LATERAL (
    SELECT jsonb_agg(
        jsonb_build_object(
            'id', pr.id,
            'name', pr.product_name,
            'category', pr.category,
            'price', pr.price,
            'quantity', (item->>'quantity')::int,
            'wiring_type_id', pr.wiring_type_id,
            'wiring_type', wt.wiring_name,
            'images', (
                SELECT jsonb_agg(pi.image_url)
                FROM product_images pi
                WHERE pi.product_id = pr.id
                AND pi.is_active = true
            )
        )
    ) AS products_list
    FROM jsonb_array_elements(
        COALESCE(p.products_wise_items, '[]'::jsonb)
    ) item
    JOIN products pr ON pr.id = (item->>'id')::int
    LEFT JOIN wiring_types wt ON wt.id = pr.wiring_type_id
) pw ON TRUE

/* ================= JOINS ================= */
LEFT JOIN clients c ON c.id = p.client_id  
LEFT JOIN users u ON u.id = p.created_by    
LEFT JOIN roles r ON r.id = u.role_id  

/* ================= FILTER ================= */

WHERE p.id = $1 and  p.deleted_at IS NULL;
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