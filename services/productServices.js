const { productModel } = require('../models/productsModel');
const { commDbModel } = require('../common/commonModel');
const { pool } = require('../config/dbConn');

const VALID_PERIODS = ['day', 'week', 'month', 'year'];

const productService = {

    addProduct: async (reqBody, userId) => {
        try {
            // Step 1: Insert the product
            const product = await productModel.addProduct(reqBody, userId);

            // Step 2: Insert images using product.id
            if (reqBody.image_urls && reqBody.image_urls.length > 0) {
                await productModel.addProductImages(product.id, reqBody.image_urls);
            }

            return {
                success: true,
                message: 'Product Added Successfully',
                product_id: product.id
            };

        } catch (error) {
            return {
                success: false,
                message: 'Failed to Insert Product',
                error: error.message
            };
        }
    },
    addMoreProduct: async (reqBody, userId) => {
        try {
            // Step 1: Insert the product
            // const product = await productModel.addProduct(reqBody, userId);

            // Step 2: Insert images using product.id
            // if (reqBody.image_urls && reqBody.image_urls.length > 0) {
            await productModel.addProductImages(reqBody.product_id, reqBody.image_urls);
            // }

            return {
                success: true,
                message: 'Images Added Successfully',
                product_id: product.id
            };

        } catch (error) {
            return {
                success: false,
                message: 'Failed to Insert Images',
                error: error.message
            };
        }
    },

    getProduct: async () => {
        try {
            const resp = await productModel.getProduct()
            return resp;
        } catch (error) {
            return {
                success: false,
                message: 'Failed To Get Product',
                error: error.message,
            };
        }
    },

    getInactiveProduct: async () => {
        try {
            const resp = await productModel.getInactiveProduct()
            return resp;
        } catch (error) {
            return {
                success: false,
                message: 'Failed To Get Product',
                error: error.message,
            };
        }
    },
    getWireType: async () => {
        try {
            const resp = await productModel.getWireType()
            return resp;
        } catch (error) {
            return {
                success: false,
                message: 'Failed To Get Wire',
                error: error.message,
            };
        }
    },

    getCategoryType: async () => {
        try {
            const resp = await productModel.getCategoryType()
            return resp;
        } catch (error) {
            return {
                success: false,
                message: 'Failed To Get Wire',
                error: error.message,
            };
        }
    },

    updateProduct: async (
        req,
        productId,
        reqBody,
        files,
        userId
    ) => {

        const updateResp =
            await productModel.updateProduct(
                productId,
                reqBody,
                userId
            );

        if (files && files.length > 0) {

            // Optional:
            await productModel.deleteProductImages(productId);

            for (const file of files) {

                const imageUrl =
                    `${req.protocol}://${req.get('host')}/uploads/products/${file.filename}`;

                await productModel.insertProductImage(
                    productId,
                    imageUrl,
                    true
                );
            }
        }

        return {
            success: true,
            message: 'Product updated successfully',
            data: updateResp.data
        };
    },

    deleteProductById: async (productId, userId) => {
        try {

            const resp = await productModel.deleteProductById(productId, userId)
            return resp

        } catch (error) {
            console.error('Error updating Product:', error);
            return {
                success: false,
                message: 'Failed to update Product',
                error: error.message,
            };
        }
    },
    activeProduct: async (productId, userId) => {
        try {

            const resp = await productModel.activeProduct(productId, userId)
            return resp

        } catch (error) {
            console.error('Error updating Product:', error);
            return {
                success: false,
                message: 'Failed to update Product',
                error: error.message,
            };
        }
    },

    deleteProposalById: async (proposalId, userId) => {
        try {

            const resp = await productModel.deleteProposalById(proposalId, userId)
            return resp

        } catch (error) {
            console.error('Error delete proposal:', error);
            return {
                success: false,
                message: 'Failed to delete proposal',
                error: error.message,
            };
        }
    },

    fetchProductUsageStats: async ({ period, fromDate, toDate }) => {
        if (period && !VALID_PERIODS.includes(period)) {
            const err = new Error(`Invalid period. Use one of: ${VALID_PERIODS.join(', ')}`);
            err.status = 400;
            throw err;
        }

        const usageStats = await productModel.getProductUsageCounts(period, fromDate, toDate);
        const totalUsage = usageStats.reduce((sum, item) => sum + item.usage_count, 0);

        return {
            filter: fromDate && toDate ? { from: fromDate, to: toDate } : { period: period || 'all' },
            total_products: usageStats.length,
            total_usage: totalUsage,
            data: usageStats,
        };
    },

    fetchAllProducts: async () => {
        return productModel.getAllProducts();
    },

    formatBucketLabel: (date, period) => {
        const d = new Date(date);
        if (period === 'day') return d.toISOString().slice(0, 10);                 // 2026-08-18
        if (period === 'week') return `Week of ${d.toISOString().slice(0, 10)}`;
        if (period === 'year') return d.getFullYear().toString();
        return d.toLocaleString('default', { month: 'short', year: 'numeric' });   // Aug 2026
    },

    fetchProductUsageTrend: async ({ productId, period }) => {
        if (!productId) {
            const err = new Error('product_id is required');
            err.status = 400;
            throw err;
        }
        if (period && !VALID_PERIODS.includes(period)) {
            const err = new Error(`Invalid period. Use one of: ${VALID_PERIODS.join(', ')}`);
            err.status = 400;
            throw err;
        }

        const rows = await productModel.getProductUsageTrend(productId, period);

        const data = rows.map(row => ({
            label: productService.formatBucketLabel(row.bucket_date, period),
            usage_count: row.usage_count,
        }));

        const totalUsage = data.reduce((sum, item) => sum + item.usage_count, 0);

        return {
            product_id: Number(productId),
            period: period || 'month',
            total_usage: totalUsage,
            data,
        };
    },

    createProposal: async (reqBody, userId) => {
        try {

            // const isCheckProduct = await productModel.checkProductById(reqBody.products_wise_items.productIds)
            // console.log(':>>>>>>>>>>>>', isCheckProduct.success)
            // if (!isCheckProduct.success) {
            //     console.log("product not found");
            // }

            const resp = await productModel.createProposal(reqBody, userId)

            return {
                success: true,
                message: 'proposal Insertes successfully',
                data: resp.data || resp,
            };

        } catch (error) {
            console.error('Error inseting proposal:', error);
            return {
                success: false,
                message: 'Failed to insert proposal',
                error: error.message,
            };
        }
    },

    updateProposal: async (proposalId, body, userId) => {
        try {
            const result = await productModel.updateProposal(proposalId, body, userId);

            if (!result) {
                return {
                    success: false,
                    message: 'Proposal not found'
                };
            }

            return {
                success: true,
                data: result
            };

        } catch (error) {
            return {
                success: false,
                message: error.message
            };
        }
    },

    updateProposalStatus: async (proposalId, proposalStatus, send_email, userId) => {
        return await productModel.updateProposalStatus(
            proposalId,
            proposalStatus,
            send_email,
            userId
        );
    },

    getProposalData: async (userId) => {
        try {

            const resp = await productModel.getProposalData(userId)

            return resp;
        } catch (error) {
            console.error('Error inseting proposal:', error);
            return {
                success: false,
                message: 'Failed to get proposal',
                error: error.message,
            };
        }
    },
    getProposalDataById: async (proposalId, userId) => {
        try {

            const resp = await productModel.getProposalDataById(proposalId, userId)

            return resp;
        } catch (error) {
            console.error('Error fatch proposal:', error);
            return {
                success: false,
                message: 'Failed to get proposal "getProposalDataById"',
                error: error.message,
            };
        }
    },

    getProposalDataByClientId: async (clientId, userId) => {
        try {

            const resp = await productModel.getProposalDataByClientId(clientId, userId)

            return resp;
        } catch (error) {
            console.error('Error fatch proposal:', error);
            return {
                success: false,
                message: 'Failed to get proposal "getProposalDataById"',
                error: error.message,
            };
        }
    },


    // // ============================================================
    // // CREATE PROPOSAL
    // // ============================================================

    // createProposals: async (data, userId = null) => {

    //     const client = await pool.connect();

    //     try {

    //         // ====================================================
    //         // VALIDATION
    //         // ====================================================

    //         if (!data) {
    //             throw new Error("Request body is required");
    //         }

    //         if (!data.client_id) {
    //             throw new Error("client_id is required");
    //         }

    //         if (!data.proposal_title) {
    //             throw new Error("proposal_title is required");
    //         }

    //         if (!data.proposal_type) {
    //             throw new Error("proposal_type is required");
    //         }

    //         if (
    //             ![
    //                 "structureWise",
    //                 "productWise"
    //             ].includes(data.proposal_type)
    //         ) {
    //             throw new Error(
    //                 "proposal_type must be structureWise or productWise"
    //             );
    //         }


    //         // ====================================================
    //         // TYPE SPECIFIC VALIDATION
    //         // ====================================================

    //         if (
    //             data.proposal_type === "structureWise" &&
    //             !Array.isArray(data.floor)
    //         ) {
    //             throw new Error(
    //                 "floor must be an array for structureWise proposal"
    //             );
    //         }


    //         if (
    //             data.proposal_type === "productWise" &&
    //             !Array.isArray(data.products_wise_items)
    //         ) {
    //             throw new Error(
    //                 "products_wise_items must be an array for productWise proposal"
    //             );
    //         }


    //         // ====================================================
    //         // START TRANSACTION
    //         // ====================================================

    //         await client.query("BEGIN");


    //         // ====================================================
    //         // CHECK CLIENT
    //         // ====================================================

    //         const existingClient =
    //             await productModel.checkClient(
    //                 client,
    //                 data.client_id
    //             );


    //         if (!existingClient) {
    //             throw new Error(
    //                 `Client with id ${data.client_id} not found`
    //             );
    //         }


    //         // ====================================================
    //         // FINANCIAL BREAKDOWN
    //         // ====================================================

    //         const financial =
    //             data.financial_breakdown || {};


    //         const proposalId =
    //             `PROP-${Date.now()}`;


    //         // ====================================================
    //         // PREPARE MASTER DATA
    //         // ====================================================

    //         const proposalData = {

    //             proposalId,

    //             client_id: data.client_id,

    //             proposal_title:
    //                 data.proposal_title,

    //             proposal_type:
    //                 data.proposal_type,

    //             recipient_name:
    //                 data.recipient_name || null,

    //             ship_to_address:
    //                 data.ship_to_address || null,

    //             use_same_address:
    //                 data.use_same_address ?? false,

    //             use_same_recipient:
    //                 data.use_same_recipient ?? false,


    //             commissioning_percentage:
    //                 Number(
    //                     data.commissioning_percentage || 0
    //                 ),

    //             discount_percentage:
    //                 Number(
    //                     data.discount_percentage || 0
    //                 ),

    //             installation_percentage:
    //                 Number(
    //                     data.installation_percentage || 0
    //                 ),


    //             grandProductsTotal:
    //                 Number(
    //                     financial.grandProductsTotal || 0
    //                 ),

    //             discountAmount:
    //                 Number(
    //                     financial.discountAmount || 0
    //                 ),

    //             afterDiscount:
    //                 Number(
    //                     financial.afterDiscount || 0
    //                 ),

    //             installationAmount:
    //                 Number(
    //                     financial.installationAmount || 0
    //                 ),

    //             commissioningAmount:
    //                 Number(
    //                     financial.commissioningAmount || 0
    //                 ),

    //             nonNuosProductsTotal:
    //                 Number(
    //                     financial.nonNuosProductsTotal || 0
    //                 ),

    //             finalTotal:
    //                 Number(
    //                     financial.finalTotal ||
    //                     data.grand_total ||
    //                     0
    //                 ),

    //             grand_total:
    //                 Number(
    //                     data.grand_total ||
    //                     financial.finalTotal ||
    //                     0
    //                 ),

    //             created_by:
    //                 userId
    //         };


    //         // ====================================================
    //         // INSERT MASTER
    //         // ====================================================

    //         const proposal =
    //             await productModel.createProposal_new(
    //                 client,
    //                 proposalData
    //             );


    //         // ====================================================
    //         // STRUCTURE WISE
    //         // ====================================================

    //         if (
    //             data.proposal_type ===
    //             "structureWise"
    //         ) {

    //             await productService.insertStructureWise(
    //                 client,
    //                 proposal.id,
    //                 data.floor
    //             );
    //         }


    //         // ====================================================
    //         // PRODUCT WISE
    //         // ====================================================

    //         if (
    //             data.proposal_type ===
    //             "productWise"
    //         ) {

    //             await productService.insertProductWise(
    //                 client,
    //                 proposal.id,
    //                 data.products_wise_items
    //             );
    //         }


    //         // ====================================================
    //         // COMMIT
    //         // ====================================================

    //         await client.query("COMMIT");


    //         // ====================================================
    //         // RETURN
    //         // ====================================================

    //         return {
    //             id: proposal.id,
    //             proposal_id: proposal.proposal_id,
    //             proposal_type: data.proposal_type
    //         };


    //     } catch (error) {

    //         // ====================================================
    //         // ROLLBACK
    //         // ====================================================

    //         await client.query("ROLLBACK");

    //         throw error;

    //     } finally {

    //         client.release();
    //     }
    // },



    // // =================================================================
    // // STRUCTURE WISE INSERT
    // // =================================================================

    // insertStructureWise: async (
    //     client,
    //     proposalId,
    //     floors
    // ) => {

    //     for (
    //         let floorIndex = 0;
    //         floorIndex < floors.length;
    //         floorIndex++
    //     ) {

    //         const floorData =
    //             floors[floorIndex];


    //         // ========================================================
    //         // FLOOR
    //         // ========================================================

    //         const floor =
    //             await productModel.createFloor(
    //                 client,
    //                 proposalId,

    //                 floorData.name ||
    //                 `Floor ${floorIndex + 1}`,

    //                 floorIndex
    //             );


    //         const floorId =
    //             floor.id;


    //         const homes =
    //             Array.isArray(floorData.homes)
    //                 ? floorData.homes
    //                 : [];


    //         // ========================================================
    //         // HOMES
    //         // ========================================================

    //         for (
    //             let homeIndex = 0;
    //             homeIndex < homes.length;
    //             homeIndex++
    //         ) {

    //             const homeData =
    //                 homes[homeIndex];


    //             const home =
    //                 await productModel.createHome(
    //                     client,
    //                     floorId,

    //                     homeData.name ||
    //                     `Home ${homeIndex + 1}`,

    //                     homeIndex
    //                 );


    //             const homeId =
    //                 home.id;


    //             const rooms =
    //                 Array.isArray(homeData.rooms)
    //                     ? homeData.rooms
    //                     : [];


    //             // ====================================================
    //             // ROOMS
    //             // ====================================================

    //             for (
    //                 let roomIndex = 0;
    //                 roomIndex < rooms.length;
    //                 roomIndex++
    //             ) {

    //                 const roomData =
    //                     rooms[roomIndex];


    //                 const room =
    //                     await productModel.createRoom(
    //                         client,
    //                         homeId,

    //                         roomData.name || "",

    //                         roomData.pkgId || null,

    //                         roomIndex
    //                     );


    //                 const roomId =
    //                     room.id;


    //                 // =================================================
    //                 // ROOM PRODUCTS
    //                 // =================================================

    //                 const roomProducts =
    //                     Array.isArray(
    //                         roomData.products
    //                     )
    //                         ? roomData.products
    //                         : [];


    //                 for (
    //                     let productIndex = 0;
    //                     productIndex < roomProducts.length;
    //                     productIndex++
    //                 ) {

    //                     const product =
    //                         roomProducts[productIndex];


    //                     if (!product.id) {
    //                         throw new Error(
    //                             "Product id is required in room products"
    //                         );
    //                     }


    //                     await productModel.createRoomProduct(
    //                         client,
    //                         proposalId,
    //                         roomId,
    //                         {
    //                             ...product,
    //                             displayOrder:
    //                                 productIndex
    //                         }
    //                     );
    //                 }


    //                 // =================================================
    //                 // SWITCHBOARDS
    //                 // =================================================

    //                 const switchboards =
    //                     Array.isArray(
    //                         roomData.switchboards
    //                     )
    //                         ? roomData.switchboards
    //                         : [];


    //                 for (
    //                     let switchboardIndex = 0;
    //                     switchboardIndex <
    //                     switchboards.length;
    //                     switchboardIndex++
    //                 ) {

    //                     const switchboard =
    //                         switchboards[
    //                         switchboardIndex
    //                         ];


    //                     const switchboardResult =
    //                         await productModel.createSwitchboard(
    //                             client,
    //                             roomId,
    //                             switchboard,
    //                             switchboardIndex
    //                         );


    //                     const switchboardId =
    //                         switchboardResult.id;


    //                     // =============================================
    //                     // SWITCHBOARD PRODUCTS
    //                     // =============================================

    //                     const products =
    //                         Array.isArray(
    //                             switchboard.products
    //                         )
    //                             ? switchboard.products
    //                             : [];


    //                     for (
    //                         let productIndex = 0;
    //                         productIndex < products.length;
    //                         productIndex++
    //                     ) {

    //                         const product =
    //                             products[productIndex];


    //                         if (!product.id) {
    //                             throw new Error(
    //                                 "Product id is required in switchboard products"
    //                             );
    //                         }


    //                         await productModel
    //                             .createSwitchboardProduct(
    //                                 client,
    //                                 proposalId,
    //                                 switchboardId,
    //                                 {
    //                                     ...product,
    //                                     displayOrder:
    //                                         productIndex
    //                                 }
    //                             );
    //                     }
    //                 }
    //             }
    //         }
    //     }
    // },


    // // =================================================================
    // // PRODUCT WISE INSERT
    // // =================================================================

    // insertProductWise: async (
    //     client,
    //     proposalId,
    //     products
    // ) => {

    //     for (
    //         let productIndex = 0;
    //         productIndex < products.length;
    //         productIndex++
    //     ) {

    //         const product =
    //             products[productIndex];


    //         if (!product.id) {
    //             throw new Error(
    //                 "Product id is required in products_wise_items"
    //             );
    //         }


    //         await productModel.createProductWiseItem(
    //             client,
    //             proposalId,
    //             {
    //                 ...product,
    //                 displayOrder: productIndex
    //             }
    //         );
    //     }
    // },


    // // ============================================================
    // // GET PROPOSALS
    // // ============================================================

    // getProposals: async (
    //     proposalId = null
    // ) => {

    //     const client =
    //         await pool.connect();


    //     try {

    //         console.log(
    //             "Fetching proposal:",
    //             proposalId || "ALL"
    //         );


    //         // ====================================================
    //         // GET MASTER DATA
    //         // ====================================================

    //         const proposals =
    //             await productModel.getProposalById(
    //                 client,
    //                 proposalId
    //             );


    //         // ====================================================
    //         // NO DATA
    //         // ====================================================

    //         if (
    //             !proposals ||
    //             proposals.length === 0
    //         ) {

    //             return [];
    //         }


    //         // ====================================================
    //         // BUILD EVERY PROPOSAL
    //         // ====================================================

    //         const response = [];


    //         for (
    //             const proposal
    //             of proposals
    //         ) {

    //             // =================================================
    //             // BASE RESPONSE
    //             // =================================================

    //             const proposalData = {

    //                 id:
    //                     proposal.proposal_db_id,

    //                 proposal_id:
    //                     proposal.proposal_no,

    //                 client_id:
    //                     proposal.proposal_client_id,

    //                 proposal_title:
    //                     proposal.proposal_title,

    //                 proposal_type:
    //                     proposal.proposal_type,


    //                 recipient_name:
    //                     proposal.recipient_name,

    //                 ship_to_address:
    //                     proposal.ship_to_address,

    //                 use_same_address:
    //                     proposal.use_same_address,

    //                 use_same_recipient:
    //                     proposal.use_same_recipient,


    //                 commissioning_percentage:
    //                     Number(
    //                         proposal.commissioning_percentage || 0
    //                     ),

    //                 discount_percentage:
    //                     Number(
    //                         proposal.discount_percentage || 0
    //                     ),

    //                 installation_percentage:
    //                     Number(
    //                         proposal.installation_percentage || 0
    //                     ),


    //                 // =============================================
    //                 // FINANCIAL BREAKDOWN
    //                 // =============================================

    //                 financial_breakdown: {

    //                     grandProductsTotal:
    //                         Number(
    //                             proposal.grand_products_total || 0
    //                         ),

    //                     discountAmount:
    //                         Number(
    //                             proposal.discount_amount || 0
    //                         ),

    //                     afterDiscount:
    //                         Number(
    //                             proposal.after_discount || 0
    //                         ),

    //                     installationAmount:
    //                         Number(
    //                             proposal.installation_amount || 0
    //                         ),

    //                     commissioningAmount:
    //                         Number(
    //                             proposal.commissioning_amount || 0
    //                         ),

    //                     nonNuosProductsTotal:
    //                         Number(
    //                             proposal.non_nuos_products_total || 0
    //                         ),

    //                     finalTotal:
    //                         Number(
    //                             proposal.final_total || 0
    //                         )
    //                 },


    //                 grand_total:
    //                     Number(
    //                         proposal.grand_total || 0
    //                     ),


    //                 floor: [],

    //                 products_wise_items: null,


    //                 // =============================================
    //                 // CLIENT DETAILS
    //                 // =============================================

    //                 client_details: {

    //                     id:
    //                         proposal.client_db_id,

    //                     client_id:
    //                         proposal.client_code,

    //                     first_name:
    //                         proposal.first_name,

    //                     last_name:
    //                         proposal.last_name,

    //                     email:
    //                         proposal.email,

    //                     mobile:
    //                         proposal.mobile,

    //                     gst:
    //                         proposal.gst,

    //                     company_name:
    //                         proposal.company_name,

    //                     state:
    //                         proposal.state,

    //                     district:
    //                         proposal.district,

    //                     taluk:
    //                         proposal.taluk,

    //                     region:
    //                         proposal.region,

    //                     country:
    //                         proposal.country,

    //                     division:
    //                         proposal.division,

    //                     pin_code:
    //                         proposal.pin_code,

    //                     address_line_one:
    //                         proposal.address_line_one,

    //                     address_line_two:
    //                         proposal.address_line_two,

    //                     company_address:
    //                         proposal.company_address,

    //                     lead_source:
    //                         proposal.lead_source,

    //                     architect_name:
    //                         proposal.architect_name,

    //                     architect_phone:
    //                         proposal.architect_phone,

    //                     date_of_installation:
    //                         proposal.date_of_installation,

    //                     site_contractor_name:
    //                         proposal.site_contractor_name,

    //                     site_contractor_phone:
    //                         proposal.site_contractor_phone,

    //                     installation_rep_in_charge:
    //                         proposal.installation_rep_in_charge
    //                 },


    //                 created_at:
    //                     proposal.created_at,

    //                 updated_at:
    //                     proposal.updated_at
    //             };


    //             // =================================================
    //             // STRUCTURE WISE
    //             // =================================================

    //             if (
    //                 proposal.proposal_type ===
    //                 "structureWise"
    //             ) {

    //                 proposalData.floor =
    //                     await productService.buildStructureWise(
    //                         client,

    //                         // IMPORTANT:
    //                         // proposal_db_id
    //                         proposal.proposal_db_id
    //                     );
    //             }


    //             // =================================================
    //             // PRODUCT WISE
    //             // =================================================

    //             if (
    //                 proposal.proposal_type ===
    //                 "productWise"
    //             ) {

    //                 proposalData.products_wise_items =
    //                     await productService.buildProductWise(
    //                         client,

    //                         // IMPORTANT:
    //                         // proposal_db_id
    //                         proposal.proposal_db_id
    //                     );
    //             }


    //             response.push(
    //                 proposalData
    //             );
    //         }


    //         return response;


    //     } finally {

    //         client.release();
    //     }
    // },


    // // ============================================================
    // // BUILD STRUCTURE WISE
    // // ============================================================

    // buildStructureWise: async (
    //     client,
    //     proposalId
    // ) => {

    //     console.log(
    //         "Building structure:",
    //         proposalId
    //     );


    //     const floors =
    //         await productModel.getProposalFloors(
    //             client,
    //             proposalId
    //         );


    //     const result = [];


    //     // ========================================================
    //     // FLOORS
    //     // ========================================================

    //     for (
    //         const floor
    //         of floors
    //     ) {

    //         const floorObject = {

    //             name:
    //                 floor.name,

    //             homes: []
    //         };


    //         // ====================================================
    //         // HOMES
    //         // ====================================================

    //         const homes =
    //             await productModel.getProposalHomes(
    //                 client,
    //                 floor.id
    //             );


    //         for (
    //             const home
    //             of homes
    //         ) {

    //             const homeObject = {

    //                 name:
    //                     home.name,

    //                 rooms: []
    //             };


    //             // =================================================
    //             // ROOMS
    //             // =================================================

    //             const rooms =
    //                 await productModel.getProposalRooms(
    //                     client,
    //                     home.id
    //                 );


    //             for (
    //                 const room
    //                 of rooms
    //             ) {

    //                 const roomObject = {

    //                     name:
    //                         room.name,

    //                     pkgId:
    //                         room.pkgId
    //                             ? Number(room.pkgId)
    //                             : null,

    //                     room_name:
    //                         room.room_name,

    //                     products: [],

    //                     switchboards: []
    //                 };


    //                 // =============================================
    //                 // ROOM PRODUCTS
    //                 // =============================================

    //                 const roomProducts =
    //                     await productModel.getRoomProducts(
    //                         client,
    //                         proposalId,
    //                         room.id
    //                     );


    //                 roomObject.products =
    //                     roomProducts.map(
    //                         productService.mapProduct
    //                     );


    //                 // =============================================
    //                 // SWITCHBOARDS
    //                 // =============================================

    //                 const switchboards =
    //                     await productModel.getProposalSwitchboards(
    //                         client,
    //                         room.id
    //                     );


    //                 for (
    //                     const switchboard
    //                     of switchboards
    //                 ) {

    //                     const switchboardObject = {

    //                         name:
    //                             switchboard.switchboard_name,

    //                         mod:
    //                             switchboard.mod,

    //                         colorValue:
    //                             switchboard.color_value,

    //                         products: []
    //                     };


    //                     // =========================================
    //                     // SWITCHBOARD PRODUCTS
    //                     // =========================================

    //                     const switchboardProducts =
    //                         await productModel
    //                             .getSwitchboardProducts(
    //                                 client,
    //                                 proposalId,
    //                                 switchboard.id
    //                             );


    //                     switchboardObject.products =
    //                         switchboardProducts.map(
    //                             productService.mapProduct
    //                         );


    //                     roomObject.switchboards.push(
    //                         switchboardObject
    //                     );
    //                 }


    //                 // =============================================
    //                 // ADD ROOM TO HOME
    //                 // =============================================

    //                 homeObject.rooms.push(
    //                     roomObject
    //                 );
    //             }


    //             // ===============================================
    //             // IMPORTANT:
    //             // ADD HOME AFTER ALL ROOMS
    //             // ===============================================

    //             floorObject.homes.push(
    //                 homeObject
    //             );
    //         }


    //         // ====================================================
    //         // ADD FLOOR
    //         // ====================================================

    //         result.push(
    //             floorObject
    //         );
    //     }


    //     return result;
    // },


    // // ============================================================
    // // BUILD PRODUCT WISE
    // // ============================================================

    // buildProductWise: async (
    //     client,
    //     proposalId
    // ) => {

    //     const products =
    //         await productModel.getProductWiseItems(
    //             client,
    //             proposalId
    //         );


    //     return products.map(
    //         productService.mapProduct
    //     );
    // },


    // // ============================================================
    // // MAP PRODUCT
    // // ============================================================

    // mapProduct: (product) => {

    //     return {

    //         id:
    //             product.product_id,

    //         name:
    //             product.product_name,

    //         price:
    //             product.price,

    //         images:
    //             product.images || [],

    //         modSize:
    //             product.modSize,

    //         category:
    //             product.category,

    //         quantity:
    //             Number(
    //                 product.quantity || 1
    //             ),

    //         firstLoad:
    //             product.first_load || "",

    //         secondLoad:
    //             product.second_load || "",

    //         thirdLoad:
    //             product.third_load || "",

    //         forthLoad:
    //             product.forth_load || "",

    //         wiring_type:
    //             product.wiring_type,

    //         wiring_type_id:
    //             product.wiring_type_id
    //     };
    // },

}

module.exports = productService;