
const { pool } = require('../config/dbConn');

const productModel = {
    addProduct: async (reqBody, userId) => {
        try {
            const {
                product_name,
                category,
                mod_size,
                mrp_price,
                discount_percentage,
                price,
                wiring_type_id,
                wiring_type,
                zigbee_type,
                switch_load_count,
                description,
               
            } = reqBody;


            // ✅ convert wiring_type_id to integer
            // const wiring_type_id = parseInt(reqBody.wiring_type_id, 10);

            // // ✅ validate integer
            // if (!Number.isInteger(wiring_type_id)) {
            //     throw new Error('wiring_type_id must be a valid integer');
            // }

            const query = `
      INSERT INTO products 
      (user_id, product_name, category, mod_size, mrp_price, discount_percentage, price, wiring_type_id, wiring_type, zigbee_type, created_by, switch_load_count, description)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8, $9, $10, $11, $12, $13)
      RETURNING id;
    `;

            const values = [
                userId,
                product_name,
                category,
                mod_size,
                mrp_price,
                discount_percentage,
                price,
                wiring_type_id || null, // ✅ integer now
                wiring_type,
                zigbee_type,
                userId,
                switch_load_count,
                description
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
                     p.mrp_price,
                     p.discount_percentage,
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
                `SELECT 
                        p.id,
                        p.product_name,
                        p.category,
                        p.mod_size,
                        p.mrp_price,
                        p.discount_percentage,
                        p.price,
                        wt.id AS wiring_type_id,
                        wt.wiring_type,
                        p.category_id,
                        ct.category_type,
                        p.zigbee_type,
                        p.switch_load_count,
                        p.description,
                        p.created_at,
                        ARRAY_AGG(t.image_url) FILTER (WHERE t.image_url IS NOT NULL) AS image_urls
                    FROM products p
                    INNER JOIN wiring_types wt  
                        ON p.wiring_type_id = wt.id
                    LEFT JOIN category_types ct ON ct.id = p.category_id 
                    LEFT JOIN product_images t 
                        ON t.product_id = p.id 
                        AND t.is_active = true
                    WHERE p.is_active = true   -- ✅ FIXED
                    GROUP BY 
                        p.id,
                        p.product_name,
                        p.category,
                        p.mod_size,
                        p.mrp_price,
                        p.discount_percentage,
                        p.price,
                        wt.id,
                        wt.wiring_type,
                        ct.category_type,
                        p.zigbee_type,
                        p.created_at
                    ORDER BY p.product_name ASC  -- ✅ MOVED HERE`
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
                     p.mrp_price,
                     p.discount_percentage,
                     p.price,
                     wt.id AS wiring_type_id,
                    -- wt.wiring_type_id ,
                     wt.wiring_type,
                     p.zigbee_type,
                     p.category_id,
                     ct.category_type,
                     p.created_at,
                     ARRAY_AGG(t.image_url) AS image_urls
                 FROM products p
                 INNER JOIN wiring_types wt  
                     ON p.wiring_type_id = wt.id
                 LEFT JOIN category_types ct ON ct.id = p.category_id 
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
                     ct.category_type,
                     p.zigbee_type,
                     p.created_at
                     ORDER BY p.product_name ASC; `
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

    getCategoryType: async () => {
        try {
            const result = await pool.query(
                `SELECT id, category_type FROM category_types ; `
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


    updateProduct: async (
        productId,
        reqBody,
        userId
    ) => {

        try {

            const {
                product_name,
                category,
                mod_size,
                mrp_price,
                discount_percentage,
                price,
                wiring_type_id,
                zigbee_type,
                description,
                category_id,
                switch_load_count
            } = reqBody;

            console.log(':>>>>>>>>>>>>', reqBody);


            // Convert wiring_type_id to integer or NULL
            const wiringTypeId =
                wiring_type_id !== undefined &&
                    wiring_type_id !== null &&
                    wiring_type_id !== ''
                    ? parseInt(wiring_type_id, 10)
                    : null;



            const query = `
                    UPDATE products
                    SET
                        product_name = $1,
                        category = $2,
                        mod_size = $3,
                        mrp_price = $4,
                        discount_percentage = $5,
                        price = $6,
                        wiring_type_id = $7,
                        category_id = $8,
                        zigbee_type = $9,
                        switch_load_count = $10,
                        description = $11,
                        updated_by = $12,
                        updated_at = NOW()
                    WHERE id = $13
                    RETURNING *;
                    `;


            const values = [
                product_name || null,
                category || null,
                mod_size ? parseInt(mod_size) : null,
                mrp_price || null,
                discount_percentage || null,
                price || null,
                wiringTypeId,
                category_id ? parseInt(category_id) : null,
                zigbee_type || null,
                switch_load_count ? parseInt(switch_load_count) : null,
                description || null,
                userId,
                productId
            ];
            // console.log("QUERY VALUES >>>>", values);

            const result = await pool.query(
                query,
                values
            );

            return {
                success: true,
                data: result.rows[0]
            };

        } catch (error) {

            console.error(
                "Update Product Error >>>>",
                error
            );

            throw error;
        }
    },
    // ===================================================
    // INSERT PRODUCT IMAGE
    // ===================================================

    insertProductImage: async (
        productId,
        imageUrl,
        isActive = true

    ) => {

        try {

            const query = `
        INSERT INTO product_images(
                product_id,
                image_url,
                is_active)

            VALUES($1, $2, $3)

            RETURNING *;
            `;

            const values = [

                productId,
                imageUrl,
                isActive
            ];

            const result =
                await pool.query(
                    query,
                    values
                );

            return {

                success: true,

                data:
                    result.rows[0]
            };

        } catch (error) {

            console.error(error);

            throw error;
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
            RETURNING *; `;

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
    deleteProductImages: async (productId) => {
        try {
            const query = `
            UPDATE product_images pi
            SET
            is_active = false
            WHERE pi.product_id = $1
            RETURNING *; `;

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
            RETURNING *; `;

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

    deleteProposalById: async (proposalId, userId) => {
        try {
            const query = `
            UPDATE proposals p
            SET
            deleted_by = $1,
                deleted_at = NOW()
            WHERE p.id = $2
            RETURNING *; `;

            const result = await pool.query(query, [userId, proposalId]);

            return {
                success: true,
                data: result.rows[0],
            };

        } catch (error) {
            console.error('Error deleting proposal details:', error);
            return {
                success: false,
                message: 'Failed to delete proposal details',
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
                use_same_recipient,
                created_at,
                proposal_title
            } = reqBody;


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
                    created_by,
                    created_at,
                    proposal_title

                )
            VALUES(
                $1, $2, $3, $4,
                $5:: jsonb,
                $6:: jsonb,
                $7,
                $8,
                $9:: jsonb,
                $10,
                $11,
                $12,
                $13,
                $14,
                $15,
                $16,
                $17
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
                userId,
                created_at,
                proposal_title
            ];

            const result = await pool.query(query, values);
            return result.rows[0];

        } catch (err) {
            console.error('Error inserting proposal:', err);
            throw err;
        }
    },


    updateProposal: async (proposalId, body, userId) => {
        const client = await pool.connect();

        try {
            await client.query('BEGIN');

            let floorData = null;
            let productsWiseData = null;

            // support both keys
            const productData =
                body.products_wise_items || body.productsWiseItems;

            if (body.floor) {
                floorData = JSON.stringify(body.floor);
            }

            if (productData) {
                if (!Array.isArray(productData)) {
                    throw new Error('products_wise_items must be array');
                }
                productsWiseData = JSON.stringify(productData);
            }

            const financialData = body.financial_breakdown
                ? JSON.stringify(body.financial_breakdown)
                : null;

            /* =====================================================
               BUILD DYNAMIC QUERY
            ===================================================== */
            const fields = [];
            const values = [];
            let index = 1;

            const addField = (column, value, cast = '') => {
                fields.push(`${column} = $${index}${cast} `);
                values.push(value);
                index++;
            };

            if (body.proposal_id !== undefined) addField('proposal_id', body.proposal_id);
            if (body.commissioning_percentage !== undefined) addField('commissioning_percentage', body.commissioning_percentage);
            if (body.discount_percentage !== undefined) addField('discount_percentage', body.discount_percentage);
            if (body.installation_percentage !== undefined) addField('installation_percentage', body.installation_percentage);
            if (body.grand_total !== undefined) addField('grand_total', body.grand_total);
            if (body.proposal_type !== undefined) addField('proposal_type', body.proposal_type);
            if (body.recipient_name !== undefined) addField('recipient_name', body.recipient_name);
            if (body.ship_to_address !== undefined) addField('ship_to_address', body.ship_to_address);
            if (body.use_same_address !== undefined) addField('use_same_address', body.use_same_address);
            if (body.use_same_recipient !== undefined) addField('use_same_recipient', body.use_same_recipient);
            if (body.updated_at !== undefined) addField('updated_at', body.updated_at);
            if (body.proposal_title !== undefined) addField('proposal_title', body.proposal_title);

            if (financialData !== null) addField('financial_breakdown', financialData, '::jsonb');
            if (floorData !== null) addField('floor', floorData, '::jsonb');
            if (productsWiseData !== null) addField('products_wise_items', productsWiseData, '::jsonb');

            // updated_at
            // addField('updated_at', new Date());

            if (fields.length === 0) {
                throw new Error('No fields to update');
            }

            /* =====================================================
               🔥 FINAL QUERY
            ===================================================== */
            const query = `
      UPDATE proposals
      SET ${fields.join(', ')}
      WHERE id = $${index}
            RETURNING *;
            `;

            values.push(proposalId);

            console.log('UPDATE QUERY:', query);
            console.log('VALUES:', values);

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

    getProposalData: async (userId) => {
        try {
            const result = await pool.query(
                `WITH product_cache AS (
                            SELECT
                                p.id,
                                p.product_name,
                                p.category,
                                p.price,
                                p.mod_size,
                                p.wiring_type_id,
                                wt.wiring_name,
                                COALESCE(
                                    jsonb_agg(
                                        DISTINCT pi.image_url
                                    ) FILTER (WHERE pi.image_url IS NOT NULL),
                                    '[]'::jsonb
                                ) AS images
                            FROM products p
                            LEFT JOIN wiring_types wt ON wt.id = p.wiring_type_id
                            LEFT JOIN product_images pi ON pi.product_id = p.id
                            GROUP BY p.id, wt.wiring_name
                        ),
                                    
                        products_wise_cache AS (
                            SELECT
                                p.id AS proposal_id,
                                jsonb_agg(
                                    jsonb_build_object(
                                        'id', pc.id,
                                        'name', pc.product_name,
                                        'category', pc.category,
                                        'price', pc.price,
                                        'quantity', (item_val->>'quantity')::int,
                                        'wiring_type_id', pc.wiring_type_id,
                                        'wiring_type', pc.wiring_name,
                                        'images', pc.images
                                    ) ORDER BY item_idx
                                ) AS products_list
                            FROM proposals p
                            CROSS JOIN jsonb_array_elements(
                                COALESCE(p.products_wise_items, '[]'::jsonb)
                            ) WITH ORDINALITY AS t(item_val, item_idx)
                            JOIN product_cache pc ON pc.id = (item_val->>'id')::int
                            WHERE p.proposal_type = 'productsWise'
                            AND p.deleted_at IS NULL
                            GROUP BY p.id
                        )
                                    
                        SELECT
                            p.id,
                            p.proposal_id,
                            p.proposal_title,
                            p.proposal_type,
                            p.created_at,
                            p.updated_at,
                                    
                            floors.floor,
                                    
                            CASE 
                                WHEN p.proposal_type = 'productsWise' 
                                THEN pwc.products_list
                                ELSE NULL
                            END AS products_wise_items,
                                    
                            p.commissioning_percentage,
                            p.discount_percentage,
                            p.financial_breakdown,
                            p.grand_total,
                            p.installation_percentage,
                            p.recipient_name,
                            p.ship_to_address,
                            p.use_same_address,
                            p.use_same_recipient,
                                    
                            jsonb_build_object(
                                'id', c.id,
                                'client_id', c.client_id,
                                'first_name', c.first_name,
                                'last_name', c.last_name,
                                'email', c.email_id,
                                'mobile', c.mobile_number,
                                'address_line_one', c.address_line_one,
                                'pin_code', c.pin_code,
                                'country', c.country,
                                'state', c.state,
                                'district', c.district,
                                'taluk', c.taluk,
                                'division', c.division,
                                'region', c.region,
                                'company_name', c.company_name,
                                'gst', c.gst,
                                'company_address', c.company_address,
                                'created_at', c.created_at,
                                'updated_at', c.updated_at,
                                'deleted_by', c.deleted_by,
                                'deleted_at', c.deleted_at,
                                'salesrepincharge', c.salesrepincharge,
                                'installation_rep_in_charge', c.installation_rep_in_charge,
                                'lead_source', c.lead_source,
                                'date_of_installation', c.date_of_installation,
                                'site_contractor_name', c.site_contractor_name,
                                'site_contractor_phone', c.site_contractor_phone,
                                'architect_name', c.architect_name,
                                'architect_phone', c.architect_phone,
                                'address_line_two', c.address_line_two
                            ) AS client_details,
                                    
                            jsonb_build_object(
                                'id', u.id,
                                'user_name', u.user_name,
                                'role', jsonb_build_object(
                                    'role_id', r.id,
                                    'role_name', r.role_name
                                )
                            ) AS created_by
                                    
                        FROM proposals p
                                    
                        LEFT JOIN LATERAL (
                            SELECT jsonb_agg(
                                jsonb_build_object(
                                    'name', fl_val->>'name',
                                    'homes', (
                                        SELECT jsonb_agg(
                                            jsonb_build_object(
                                                'name', hm_val->>'name',
                                                'rooms', (
                                                    SELECT jsonb_agg(
                                                        jsonb_build_object(
                                                            'name', rm_val->>'name',
                                    
                                                            -- ✅ ROOM PRODUCTS - ORDER PRESERVED
                                                            'products', COALESCE(
                                                                (
                                                                    SELECT jsonb_agg(
                                                                        jsonb_build_object(
                                                                            'id', pc.id,
                                                                            'name', pc.product_name,
                                                                            'category', pc.category,
                                                                            'price', pc.price,
                                                                            'modSize', pc.mod_size,
                                                                            'wiring_type_id', pc.wiring_type_id,
                                                                            'wiring_type', pc.wiring_name,
                                                                            'images', pc.images,
                                                                            'firstLoad', COALESCE(
                                                                                CASE 
                                                                                    WHEN jsonb_typeof(pid_val) = 'object' 
                                                                                    THEN pid_val->>'firstLoad'
                                                                                    ELSE ''
                                                                                END, ''
                                                                            ),
                                                                            'secondLoad', COALESCE(
                                                                                CASE 
                                                                                    WHEN jsonb_typeof(pid_val) = 'object' 
                                                                                    THEN pid_val->>'secondLoad'
                                                                                    ELSE ''
                                                                                END, ''
                                                                            ),
                                                                            'thirdLoad', COALESCE(
                                                                                CASE 
                                                                                    WHEN jsonb_typeof(pid_val) = 'object' 
                                                                                    THEN pid_val->>'thirdLoad'
                                                                                    ELSE ''
                                                                                END, ''
                                                                            ),
                                                                            'forthLoad', COALESCE(
                                                                                CASE 
                                                                                    WHEN jsonb_typeof(pid_val) = 'object' 
                                                                                    THEN pid_val->>'forthLoad'
                                                                                    ELSE ''
                                                                                END, ''
                                                                            )
                                                                        ) ORDER BY pid_idx
                                                                    )
                                                                    FROM jsonb_array_elements(
                                                                        COALESCE(rm_val->'products', '[]'::jsonb)
                                                                    ) WITH ORDINALITY AS t(pid_val, pid_idx)
                                                                    JOIN product_cache pc ON pc.id = (
                                                                        CASE 
                                                                            WHEN jsonb_typeof(pid_val) = 'number' 
                                                                            THEN pid_val::text::int
                                                                            WHEN jsonb_typeof(pid_val) = 'object' 
                                                                            THEN (pid_val->>'id')::int
                                                                        END
                                                                    )
                                                                ),
                                                                '[]'::jsonb
                                                            ),
                                    
                                                            -- ✅ SWITCHBOARDS - ORDER PRESERVED
                                                            'switchboards', (
                                                                SELECT jsonb_agg(
                                                                    jsonb_build_object(
                                                                        'name', sb_val->>'name',
                                                                        'mod', sb_val->'mod',
                                                                        'colorValue', sb_val->'colorValue',
                                    
                                                                        -- ✅ SWITCHBOARD PRODUCTS - ORDER PRESERVED
                                                                        'products', COALESCE(
                                                                            (
                                                                                SELECT jsonb_agg(
                                                                                    jsonb_build_object(
                                                                                        'id', pc.id,
                                                                                        'name', pc.product_name,
                                                                                        'category', pc.category,
                                                                                        'price', pc.price,
                                                                                        'modSize', pc.mod_size,
                                                                                        'wiring_type_id', pc.wiring_type_id,
                                                                                        'wiring_type', pc.wiring_name,
                                                                                        'images', pc.images,
                                                                                        'firstLoad', COALESCE(
                                                                                            CASE 
                                                                                                WHEN jsonb_typeof(spid_val) = 'object' 
                                                                                                THEN spid_val->>'firstLoad'
                                                                                                ELSE ''
                                                                                            END, ''
                                                                                        ),
                                                                                        'secondLoad', COALESCE(
                                                                                            CASE 
                                                                                                WHEN jsonb_typeof(spid_val) = 'object' 
                                                                                                THEN spid_val->>'secondLoad'
                                                                                                ELSE ''
                                                                                            END, ''
                                                                                        ),
                                                                                        'thirdLoad', COALESCE(
                                                                                            CASE 
                                                                                                WHEN jsonb_typeof(spid_val) = 'object' 
                                                                                                THEN spid_val->>'thirdLoad'
                                                                                                ELSE ''
                                                                                            END, ''
                                                                                        ),
                                                                                        'forthLoad', COALESCE(
                                                                                            CASE 
                                                                                                WHEN jsonb_typeof(spid_val) = 'object' 
                                                                                                THEN spid_val->>'forthLoad'
                                                                                                ELSE ''
                                                                                            END, ''
                                                                                        )
                                                                                    ) ORDER BY spid_idx
                                                                                )
                                                                                FROM jsonb_array_elements(
                                                                                    COALESCE(sb_val->'products', '[]'::jsonb)
                                                                                ) WITH ORDINALITY AS t(spid_val, spid_idx)
                                                                                JOIN product_cache pc ON pc.id = (
                                                                                    CASE 
                                                                                        WHEN jsonb_typeof(spid_val) = 'number' 
                                                                                        THEN spid_val::text::int
                                                                                        WHEN jsonb_typeof(spid_val) = 'object' 
                                                                                        THEN (spid_val->>'id')::int
                                                                                    END
                                                                                )
                                                                            ),
                                                                            '[]'::jsonb
                                                                        )
                                                                    ) ORDER BY sb_idx
                                                                )
                                                                FROM jsonb_array_elements(
                                                                    COALESCE(rm_val->'switchboards', '[]'::jsonb)
                                                                ) WITH ORDINALITY AS t(sb_val, sb_idx)
                                                            )
                                                        ) ORDER BY rm_idx
                                                    )
                                                    FROM jsonb_array_elements(
                                                        COALESCE(hm_val->'rooms', '[]'::jsonb)
                                                    ) WITH ORDINALITY AS t(rm_val, rm_idx)
                                                )
                                            ) ORDER BY hm_idx
                                        )
                                        FROM jsonb_array_elements(
                                            COALESCE(fl_val->'homes', '[]'::jsonb)
                                        ) WITH ORDINALITY AS t(hm_val, hm_idx)
                                    )
                                ) ORDER BY fl_idx
                            ) AS floor
                            FROM jsonb_array_elements(
                                COALESCE(p.floor, '[]'::jsonb)
                            ) WITH ORDINALITY AS t(fl_val, fl_idx)
                        ) floors ON TRUE
                                    
                        LEFT JOIN products_wise_cache pwc ON pwc.proposal_id = p.id
                        LEFT JOIN clients c ON c.id = p.client_id
                        LEFT JOIN users u ON u.id = p.created_by
                        LEFT JOIN roles r ON r.id = u.role_id

                    WHERE p.deleted_at IS NULL;`

            );

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
                `WITH product_cache AS (
                            SELECT
                                p.id,
                                p.product_name,
                                p.category,
                                p.price,
                                p.mod_size,
                                p.wiring_type_id,
                                wt.wiring_name,
                                COALESCE(
                                    jsonb_agg(
                                        DISTINCT pi.image_url
                                    ) FILTER (WHERE pi.image_url IS NOT NULL),
                                    '[]'::jsonb
                                ) AS images
                            FROM products p
                            LEFT JOIN wiring_types wt ON wt.id = p.wiring_type_id
                            LEFT JOIN product_images pi ON pi.product_id = p.id
                            GROUP BY p.id, wt.wiring_name
                        ),
                                    
                        products_wise_cache AS (
                            SELECT
                                p.id AS proposal_id,
                                jsonb_agg(
                                    jsonb_build_object(
                                        'id', pc.id,
                                        'name', pc.product_name,
                                        'category', pc.category,
                                        'price', pc.price,
                                        'quantity', (item_val->>'quantity')::int,
                                        'wiring_type_id', pc.wiring_type_id,
                                        'wiring_type', pc.wiring_name,
                                        'images', pc.images
                                    ) ORDER BY item_idx
                                ) AS products_list
                            FROM proposals p
                            CROSS JOIN jsonb_array_elements(
                                COALESCE(p.products_wise_items, '[]'::jsonb)
                            ) WITH ORDINALITY AS t(item_val, item_idx)
                            JOIN product_cache pc ON pc.id = (item_val->>'id')::int
                            WHERE p.proposal_type = 'productsWise'
                            AND p.deleted_at IS NULL
                            GROUP BY p.id
                        )
                                    
                        SELECT
                            p.id,
                            p.proposal_id,
                            p.proposal_title,
                            p.proposal_type,
                            p.created_at,
                            p.updated_at,
                                    
                            floors.floor,
                                    
                            CASE 
                                WHEN p.proposal_type = 'productsWise' 
                                THEN pwc.products_list
                                ELSE NULL
                            END AS products_wise_items,
                                    
                            p.commissioning_percentage,
                            p.discount_percentage,
                            p.financial_breakdown,
                            p.grand_total,
                            p.installation_percentage,
                            p.recipient_name,
                            p.ship_to_address,
                            p.use_same_address,
                            p.use_same_recipient,
                                    
                            jsonb_build_object(
                                'id', c.id,
                                'client_id', c.client_id,
                                'first_name', c.first_name,
                                'last_name', c.last_name,
                                'email', c.email_id,
                                'mobile', c.mobile_number,
                                'address_line_one', c.address_line_one,
                                'pin_code', c.pin_code,
                                'country', c.country,
                                'state', c.state,
                                'district', c.district,
                                'taluk', c.taluk,
                                'division', c.division,
                                'region', c.region,
                                'company_name', c.company_name,
                                'gst', c.gst,
                                'company_address', c.company_address,
                                'created_at', c.created_at,
                                'updated_at', c.updated_at,
                                'deleted_by', c.deleted_by,
                                'deleted_at', c.deleted_at,
                                'salesrepincharge', c.salesrepincharge,
                                'installation_rep_in_charge', c.installation_rep_in_charge,
                                'lead_source', c.lead_source,
                                'date_of_installation', c.date_of_installation,
                                'site_contractor_name', c.site_contractor_name,
                                'site_contractor_phone', c.site_contractor_phone,
                                'architect_name', c.architect_name,
                                'architect_phone', c.architect_phone,
                                'address_line_two', c.address_line_two
                            ) AS client_details,
                                    
                            jsonb_build_object(
                                'id', u.id,
                                'user_name', u.user_name,
                                'role', jsonb_build_object(
                                    'role_id', r.id,
                                    'role_name', r.role_name
                                )
                            ) AS created_by
                                    
                        FROM proposals p
                                    
                        LEFT JOIN LATERAL (
                            SELECT jsonb_agg(
                                jsonb_build_object(
                                    'name', fl_val->>'name',
                                    'homes', (
                                        SELECT jsonb_agg(
                                            jsonb_build_object(
                                                'name', hm_val->>'name',
                                                'rooms', (
                                                    SELECT jsonb_agg(
                                                        jsonb_build_object(
                                                            'name', rm_val->>'name',
                                    
                                                            -- ✅ ROOM PRODUCTS - ORDER PRESERVED
                                                            'products', COALESCE(
                                                                (
                                                                    SELECT jsonb_agg(
                                                                        jsonb_build_object(
                                                                            'id', pc.id,
                                                                            'name', pc.product_name,
                                                                            'category', pc.category,
                                                                            'price', pc.price,
                                                                            'modSize', pc.mod_size,
                                                                            'wiring_type_id', pc.wiring_type_id,
                                                                            'wiring_type', pc.wiring_name,
                                                                            'images', pc.images,
                                                                            'firstLoad', COALESCE(
                                                                                CASE 
                                                                                    WHEN jsonb_typeof(pid_val) = 'object' 
                                                                                    THEN pid_val->>'firstLoad'
                                                                                    ELSE ''
                                                                                END, ''
                                                                            ),
                                                                            'secondLoad', COALESCE(
                                                                                CASE 
                                                                                    WHEN jsonb_typeof(pid_val) = 'object' 
                                                                                    THEN pid_val->>'secondLoad'
                                                                                    ELSE ''
                                                                                END, ''
                                                                            ),
                                                                            'thirdLoad', COALESCE(
                                                                                CASE 
                                                                                    WHEN jsonb_typeof(pid_val) = 'object' 
                                                                                    THEN pid_val->>'thirdLoad'
                                                                                    ELSE ''
                                                                                END, ''
                                                                            ),
                                                                            'forthLoad', COALESCE(
                                                                                CASE 
                                                                                    WHEN jsonb_typeof(pid_val) = 'object' 
                                                                                    THEN pid_val->>'forthLoad'
                                                                                    ELSE ''
                                                                                END, ''
                                                                            )
                                                                        ) ORDER BY pid_idx
                                                                    )
                                                                    FROM jsonb_array_elements(
                                                                        COALESCE(rm_val->'products', '[]'::jsonb)
                                                                    ) WITH ORDINALITY AS t(pid_val, pid_idx)
                                                                    JOIN product_cache pc ON pc.id = (
                                                                        CASE 
                                                                            WHEN jsonb_typeof(pid_val) = 'number' 
                                                                            THEN pid_val::text::int
                                                                            WHEN jsonb_typeof(pid_val) = 'object' 
                                                                            THEN (pid_val->>'id')::int
                                                                        END
                                                                    )
                                                                ),
                                                                '[]'::jsonb
                                                            ),
                                    
                                                            -- ✅ SWITCHBOARDS - ORDER PRESERVED
                                                            'switchboards', (
                                                                SELECT jsonb_agg(
                                                                    jsonb_build_object(
                                                                        'name', sb_val->>'name',
                                                                        'mod', sb_val->'mod',
                                                                        'colorValue', sb_val->'colorValue',
                                    
                                                                        -- ✅ SWITCHBOARD PRODUCTS - ORDER PRESERVED
                                                                        'products', COALESCE(
                                                                            (
                                                                                SELECT jsonb_agg(
                                                                                    jsonb_build_object(
                                                                                        'id', pc.id,
                                                                                        'name', pc.product_name,
                                                                                        'category', pc.category,
                                                                                        'price', pc.price,
                                                                                        'modSize', pc.mod_size,
                                                                                        'wiring_type_id', pc.wiring_type_id,
                                                                                        'wiring_type', pc.wiring_name,
                                                                                        'images', pc.images,
                                                                                        'firstLoad', COALESCE(
                                                                                            CASE 
                                                                                                WHEN jsonb_typeof(spid_val) = 'object' 
                                                                                                THEN spid_val->>'firstLoad'
                                                                                                ELSE ''
                                                                                            END, ''
                                                                                        ),
                                                                                        'secondLoad', COALESCE(
                                                                                            CASE 
                                                                                                WHEN jsonb_typeof(spid_val) = 'object' 
                                                                                                THEN spid_val->>'secondLoad'
                                                                                                ELSE ''
                                                                                            END, ''
                                                                                        ),
                                                                                        'thirdLoad', COALESCE(
                                                                                            CASE 
                                                                                                WHEN jsonb_typeof(spid_val) = 'object' 
                                                                                                THEN spid_val->>'thirdLoad'
                                                                                                ELSE ''
                                                                                            END, ''
                                                                                        ),
                                                                                        'forthLoad', COALESCE(
                                                                                            CASE 
                                                                                                WHEN jsonb_typeof(spid_val) = 'object' 
                                                                                                THEN spid_val->>'forthLoad'
                                                                                                ELSE ''
                                                                                            END, ''
                                                                                        )
                                                                                    ) ORDER BY spid_idx
                                                                                )
                                                                                FROM jsonb_array_elements(
                                                                                    COALESCE(sb_val->'products', '[]'::jsonb)
                                                                                ) WITH ORDINALITY AS t(spid_val, spid_idx)
                                                                                JOIN product_cache pc ON pc.id = (
                                                                                    CASE 
                                                                                        WHEN jsonb_typeof(spid_val) = 'number' 
                                                                                        THEN spid_val::text::int
                                                                                        WHEN jsonb_typeof(spid_val) = 'object' 
                                                                                        THEN (spid_val->>'id')::int
                                                                                    END
                                                                                )
                                                                            ),
                                                                            '[]'::jsonb
                                                                        )
                                                                    ) ORDER BY sb_idx
                                                                )
                                                                FROM jsonb_array_elements(
                                                                    COALESCE(rm_val->'switchboards', '[]'::jsonb)
                                                                ) WITH ORDINALITY AS t(sb_val, sb_idx)
                                                            )
                                                        ) ORDER BY rm_idx
                                                    )
                                                    FROM jsonb_array_elements(
                                                        COALESCE(hm_val->'rooms', '[]'::jsonb)
                                                    ) WITH ORDINALITY AS t(rm_val, rm_idx)
                                                )
                                            ) ORDER BY hm_idx
                                        )
                                        FROM jsonb_array_elements(
                                            COALESCE(fl_val->'homes', '[]'::jsonb)
                                        ) WITH ORDINALITY AS t(hm_val, hm_idx)
                                    )
                                ) ORDER BY fl_idx
                            ) AS floor
                            FROM jsonb_array_elements(
                                COALESCE(p.floor, '[]'::jsonb)
                            ) WITH ORDINALITY AS t(fl_val, fl_idx)
                        ) floors ON TRUE
                                    
                        LEFT JOIN products_wise_cache pwc ON pwc.proposal_id = p.id
                        LEFT JOIN clients c ON c.id = p.client_id
                        LEFT JOIN users u ON u.id = p.created_by
                        LEFT JOIN roles r ON r.id = u.role_id

                    /* ================= FILTER ================= */
                  
                    WHERE p.id = $1 and  p.deleted_at IS NULL; `, [proposalId]);

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
    },

    getProposalDataByClientId: async (clientId, userId) => {
        try {

            const result = await pool.query(
                `WITH product_cache AS (
                            SELECT
                                p.id,
                                p.product_name,
                                p.category,
                                p.price,
                                p.mod_size,
                                p.wiring_type_id,
                                wt.wiring_name,
                                COALESCE(
                                    jsonb_agg(
                                        DISTINCT pi.image_url
                                    ) FILTER (WHERE pi.image_url IS NOT NULL),
                                    '[]'::jsonb
                                ) AS images
                            FROM products p
                            LEFT JOIN wiring_types wt ON wt.id = p.wiring_type_id
                            LEFT JOIN product_images pi ON pi.product_id = p.id
                            GROUP BY p.id, wt.wiring_name
                        ),

                        products_wise_cache AS (
                            SELECT
                                p.id AS proposal_id,
                                jsonb_agg(
                                    jsonb_build_object(
                                        'id', pc.id,
                                        'name', pc.product_name,
                                        'category', pc.category,
                                        'price', pc.price,
                                        'quantity', (item_val->>'quantity')::int,
                                        'wiring_type_id', pc.wiring_type_id,
                                        'wiring_type', pc.wiring_name,
                                        'images', pc.images
                                    ) ORDER BY item_idx
                                ) AS products_list
                            FROM proposals p
                            CROSS JOIN jsonb_array_elements(
                                COALESCE(p.products_wise_items, '[]'::jsonb)
                            ) WITH ORDINALITY AS t(item_val, item_idx)
                            JOIN product_cache pc ON pc.id = (item_val->>'id')::int
                            WHERE p.proposal_type = 'productsWise'
                            AND p.deleted_at IS NULL
                            GROUP BY p.id
                        )

                        SELECT
                            p.id,
                            p.proposal_id,
                            p.proposal_title,
                            p.proposal_type,
                            p.created_at,
                            p.updated_at,

                            floors.floor,

                            CASE 
                                WHEN p.proposal_type = 'productsWise' 
                                THEN pwc.products_list
                                ELSE NULL
                            END AS products_wise_items,

                            p.commissioning_percentage,
                            p.discount_percentage,
                            p.financial_breakdown,
                            p.grand_total,
                            p.installation_percentage,
                            p.recipient_name,
                            p.ship_to_address,
                            p.use_same_address,
                            p.use_same_recipient,

                            jsonb_build_object(
                                'id', c.id,
                                'client_id', c.client_id,
                                'first_name', c.first_name,
                                'last_name', c.last_name,
                                'email', c.email_id,
                                'mobile', c.mobile_number,
                                'address_line_one', c.address_line_one,
                                'pin_code', c.pin_code,
                                'country', c.country,
                                'state', c.state,
                                'district', c.district,
                                'taluk', c.taluk,
                                'division', c.division,
                                'region', c.region,
                                'company_name', c.company_name,
                                'gst', c.gst,
                                'company_address', c.company_address,
                                'created_at', c.created_at,
                                'updated_at', c.updated_at,
                                'deleted_by', c.deleted_by,
                                'deleted_at', c.deleted_at,
                                'salesrepincharge', c.salesrepincharge,
                                'installation_rep_in_charge', c.installation_rep_in_charge,
                                'lead_source', c.lead_source,
                                'date_of_installation', c.date_of_installation,
                                'site_contractor_name', c.site_contractor_name,
                                'site_contractor_phone', c.site_contractor_phone,
                                'architect_name', c.architect_name,
                                'architect_phone', c.architect_phone,
                                'address_line_two', c.address_line_two
                            ) AS client_details,

                            jsonb_build_object(
                                'id', u.id,
                                'user_name', u.user_name,
                                'role', jsonb_build_object(
                                    'role_id', r.id,
                                    'role_name', r.role_name
                                )
                            ) AS created_by

                        FROM proposals p

                        LEFT JOIN LATERAL (
                            SELECT jsonb_agg(
                                jsonb_build_object(
                                    'name', fl_val->>'name',
                                    'homes', (
                                        SELECT jsonb_agg(
                                            jsonb_build_object(
                                                'name', hm_val->>'name',
                                                'rooms', (
                                                    SELECT jsonb_agg(
                                                        jsonb_build_object(
                                                            'name', rm_val->>'name',

                                                            -- ✅ ROOM PRODUCTS - ORDER PRESERVED
                                                            'products', COALESCE(
                                                                (
                                                                    SELECT jsonb_agg(
                                                                        jsonb_build_object(
                                                                            'id', pc.id,
                                                                            'name', pc.product_name,
                                                                            'category', pc.category,
                                                                            'price', pc.price,
                                                                            'modSize', pc.mod_size,
                                                                            'wiring_type_id', pc.wiring_type_id,
                                                                            'wiring_type', pc.wiring_name,
                                                                            'images', pc.images,
                                                                            'firstLoad', COALESCE(
                                                                                CASE 
                                                                                    WHEN jsonb_typeof(pid_val) = 'object' 
                                                                                    THEN pid_val->>'firstLoad'
                                                                                    ELSE ''
                                                                                END, ''
                                                                            ),
                                                                            'secondLoad', COALESCE(
                                                                                CASE 
                                                                                    WHEN jsonb_typeof(pid_val) = 'object' 
                                                                                    THEN pid_val->>'secondLoad'
                                                                                    ELSE ''
                                                                                END, ''
                                                                            ),
                                                                            'thirdLoad', COALESCE(
                                                                                CASE 
                                                                                    WHEN jsonb_typeof(pid_val) = 'object' 
                                                                                    THEN pid_val->>'thirdLoad'
                                                                                    ELSE ''
                                                                                END, ''
                                                                            ),
                                                                            'forthLoad', COALESCE(
                                                                                CASE 
                                                                                    WHEN jsonb_typeof(pid_val) = 'object' 
                                                                                    THEN pid_val->>'forthLoad'
                                                                                    ELSE ''
                                                                                END, ''
                                                                            )
                                                                        ) ORDER BY pid_idx
                                                                    )
                                                                    FROM jsonb_array_elements(
                                                                        COALESCE(rm_val->'products', '[]'::jsonb)
                                                                    ) WITH ORDINALITY AS t(pid_val, pid_idx)
                                                                    JOIN product_cache pc ON pc.id = (
                                                                        CASE 
                                                                            WHEN jsonb_typeof(pid_val) = 'number' 
                                                                            THEN pid_val::text::int
                                                                            WHEN jsonb_typeof(pid_val) = 'object' 
                                                                            THEN (pid_val->>'id')::int
                                                                        END
                                                                    )
                                                                ),
                                                                '[]'::jsonb
                                                            ),

                                                            -- ✅ SWITCHBOARDS - ORDER PRESERVED
                                                            'switchboards', (
                                                                SELECT jsonb_agg(
                                                                    jsonb_build_object(
                                                                        'name', sb_val->>'name',
                                                                        'mod', sb_val->'mod',
                                                                        'colorValue', sb_val->'colorValue',

                                                                        -- ✅ SWITCHBOARD PRODUCTS - ORDER PRESERVED
                                                                        'products', COALESCE(
                                                                            (
                                                                                SELECT jsonb_agg(
                                                                                    jsonb_build_object(
                                                                                        'id', pc.id,
                                                                                        'name', pc.product_name,
                                                                                        'category', pc.category,
                                                                                        'price', pc.price,
                                                                                        'modSize', pc.mod_size,
                                                                                        'wiring_type_id', pc.wiring_type_id,
                                                                                        'wiring_type', pc.wiring_name,
                                                                                        'images', pc.images,
                                                                                        'firstLoad', COALESCE(
                                                                                            CASE 
                                                                                                WHEN jsonb_typeof(spid_val) = 'object' 
                                                                                                THEN spid_val->>'firstLoad'
                                                                                                ELSE ''
                                                                                            END, ''
                                                                                        ),
                                                                                        'secondLoad', COALESCE(
                                                                                            CASE 
                                                                                                WHEN jsonb_typeof(spid_val) = 'object' 
                                                                                                THEN spid_val->>'secondLoad'
                                                                                                ELSE ''
                                                                                            END, ''
                                                                                        ),
                                                                                        'thirdLoad', COALESCE(
                                                                                            CASE 
                                                                                                WHEN jsonb_typeof(spid_val) = 'object' 
                                                                                                THEN spid_val->>'thirdLoad'
                                                                                                ELSE ''
                                                                                            END, ''
                                                                                        ),
                                                                                        'forthLoad', COALESCE(
                                                                                            CASE 
                                                                                                WHEN jsonb_typeof(spid_val) = 'object' 
                                                                                                THEN spid_val->>'forthLoad'
                                                                                                ELSE ''
                                                                                            END, ''
                                                                                        )
                                                                                    ) ORDER BY spid_idx
                                                                                )
                                                                                FROM jsonb_array_elements(
                                                                                    COALESCE(sb_val->'products', '[]'::jsonb)
                                                                                ) WITH ORDINALITY AS t(spid_val, spid_idx)
                                                                                JOIN product_cache pc ON pc.id = (
                                                                                    CASE 
                                                                                        WHEN jsonb_typeof(spid_val) = 'number' 
                                                                                        THEN spid_val::text::int
                                                                                        WHEN jsonb_typeof(spid_val) = 'object' 
                                                                                        THEN (spid_val->>'id')::int
                                                                                    END
                                                                                )
                                                                            ),
                                                                            '[]'::jsonb
                                                                        )
                                                                    ) ORDER BY sb_idx
                                                                )
                                                                FROM jsonb_array_elements(
                                                                    COALESCE(rm_val->'switchboards', '[]'::jsonb)
                                                                ) WITH ORDINALITY AS t(sb_val, sb_idx)
                                                            )
                                                        ) ORDER BY rm_idx
                                                    )
                                                    FROM jsonb_array_elements(
                                                        COALESCE(hm_val->'rooms', '[]'::jsonb)
                                                    ) WITH ORDINALITY AS t(rm_val, rm_idx)
                                                )
                                            ) ORDER BY hm_idx
                                        )
                                        FROM jsonb_array_elements(
                                            COALESCE(fl_val->'homes', '[]'::jsonb)
                                        ) WITH ORDINALITY AS t(hm_val, hm_idx)
                                    )
                                ) ORDER BY fl_idx
                            ) AS floor
                            FROM jsonb_array_elements(
                                COALESCE(p.floor, '[]'::jsonb)
                            ) WITH ORDINALITY AS t(fl_val, fl_idx)
                        ) floors ON TRUE

                        LEFT JOIN products_wise_cache pwc ON pwc.proposal_id = p.id
                        LEFT JOIN clients c ON c.id = p.client_id
                        LEFT JOIN users u ON u.id = p.created_by
                        LEFT JOIN roles r ON r.id = u.role_id

                        WHERE p.client_id = $1
                        AND p.deleted_at IS NULL; `, [clientId]);

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