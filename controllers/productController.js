const jwt = require('jsonwebtoken');
const productService = require('../services/productServices');
const { HttpStatus } = require('../constants/httpStatusCodeConstant');
const { HttpMessage } = require('../constants/httpStatusMessageConstant');

const productController = {

    addProduct: async (req, res) => {
        try {
            const reqBody = req.body;

            const userId = req.user.id;

            // Convert uploaded files into accessible URLs
            const imageUrls = req.files.map(file =>
                `${req.protocol}://${req.get("host")}/uploads/products/${file.filename}`
            );
            // console.log('image url :.1111111', imageUrls);

            reqBody.image_urls = imageUrls;

            // console.log(reqBody, userId);

            // return
            const resp = await productService.addProduct(reqBody, userId);

            return res.status(201).json({
                message: "Product Created Successfully",
                data: resp
            });

        } catch (error) {
            console.log("Error:", error);
            return res.status(500).json({ message: "Server Error" });
        }
    },

    addMoreProduct: async (req, res) => {
        try {
            const reqBody = req.body;
            const userId = req.user.id;

            console.log('1111111111', reqBody, userId);

            // Convert uploaded files into accessible URLs
            const imageUrls = req.files.map(file =>
                `${req.protocol}://${req.get("host")}/uploads/products/${file.filename}`
            );
            console.log('image url :.1111111', imageUrls);

            reqBody.image_urls = imageUrls;

            const resp = await productService.addMoreProduct(reqBody, userId);

            return res.status(201).json({
                message: "Images Added Successfully",
                data: resp
            });

        } catch (error) {
            console.log("Error:", error);
            return res.status(500).json({ message: "Server Error" });
        }
    },

    getProduct: async (req, res) => {
        try {
            console.log(req.user);

            const userId = req.user.id
            const resp = await productService.getProduct(userId)
            res.status(HttpStatus.CREATED).json({ resp });
        } catch (error) {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: HttpMessage.INTERNAL_SERVER_ERROR });
        }
    },

    getInactiveProduct: async (req, res) => {
        try {
            const productId = req.params.id
            console.log(productId);

            const userId = req.user.id
            const resp = await productService.getInactiveProduct(userId)
            res.status(HttpStatus.CREATED).json({ resp });
        } catch (error) {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: HttpMessage.INTERNAL_SERVER_ERROR });
        }
    },

    getWireType: async (req, res) => {
        try {

            const userId = req.user.id
            const resp = await productService.getWireType(userId)
            res.status(HttpStatus.CREATED).json({ resp });
        } catch (error) {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: HttpMessage.INTERNAL_SERVER_ERROR });
        }
    },

    getCategoryType: async (req, res) => {
        try {

            const userId = req.user.id
            const resp = await productService.getCategoryType(userId)
            res.status(HttpStatus.CREATED).json({ resp });
        } catch (error) {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: HttpMessage.INTERNAL_SERVER_ERROR });
        }
    },

    updateProduct: async (req, res) => {

        try {

            const productId = req.params.id;

            const resp =
                await productService.updateProduct(
                    req,
                    productId,
                    req.body,
                    req.files || [],
                    req.user.id
                );

            return res.status(200).json(resp);

        } catch (error) {

            console.error(error);

            return res.status(500).json({
                success: false,
                message: 'Internal Server Error'
            });
        }
    },

    deleteProductById: async (req, res) => {
        try {
            const productId = req.params.id;
            console.log(productId);


            const userId = req.user.id;

            const resp = await productService.deleteProductById(productId, userId);

            res.status(HttpStatus.CREATED).json({
                data: resp
            });


        } catch (error) {
            console.error(error);
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: HttpMessage.INTERNAL_SERVER_ERROR });
        }
    },

    activeProduct: async (req, res) => {
        try {
            const productId = req.params.id;
            console.log(productId);


            const userId = req.user.id;

            const resp = await productService.activeProduct(productId, userId);

            res.status(HttpStatus.CREATED).json({
                data: resp
            });

        } catch (error) {
            console.error(error);
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: HttpMessage.INTERNAL_SERVER_ERROR });
        }
    },

    createProposal: async (req, res) => {
        try {
            const reqBody = req.body
            const userId = req.user.id

            const resp = await productService.createProposal(reqBody, userId)

            res.status(HttpStatus.CREATED).json({
                data: resp
            });

        } catch (error) {
            console.error(error);
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: HttpMessage.INTERNAL_SERVER_ERROR });
        }
    },

    updateProposal: async (req, res) => {
        try {
            const proposalId = req.params.id;
            const userId = req.user.id;
            const body = req.body;

            const result = await productService.updateProposal(proposalId, body, userId);

            if (!result.success) {
                return res.status(400).json({ message: result.message });
            }

            return res.status(200).json({
                message: 'Proposal updated successfully',
                data: result.data
            });

        } catch (error) {
            console.error('Update Proposal Error:', error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    },

    updateProposalStatus: async (req, res) => {
        try {

            const proposalId = req.params.id;
            const { proposal_status, send_email } = req.body;
            const userId = req.user.id;

            const data = await productService.updateProposalStatus(
                proposalId,
                proposal_status,
                send_email,
                userId
            );

            return res.status(200).json({
                success: true,
                message: "Proposal status updated successfully.",
                data
            });

        } catch (error) {

            console.error(error);

            return res.status(500).json({
                message: error.message
            });

        }
    },

    getProposalData: async (req, res) => {
        try {
            const reqBody = req.body
            const userId = req.user.id
            console.log('req.user.id:>>>>>>>>>>>>>>>', req.user.id);
            const resp = await productService.getProposalData(userId)
            res.status(HttpStatus.CREATED).json({
                data: resp
            });
        } catch (error) {
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: HttpMessage.INTERNAL_SERVER_ERROR });
            console.error(error);
        }
    },

    getProposalDataById: async (req, res) => {
        try {
            const proposalId = req.params.id
            const userId = req.user.id
            const resp = await productService.getProposalDataById(proposalId, userId)
            res.status(HttpStatus.CREATED).json({
                data: resp
            });
        } catch (error) {
            console.error(error);
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: HttpMessage.INTERNAL_SERVER_ERROR });
        }
    },

    getProposalDataByClientId: async (req, res) => {
        try {
            const clientId = req.params.client_id
            const userId = req.user.id
            const resp = await productService.getProposalDataByClientId(clientId, userId)
            res.status(HttpStatus.CREATED).json({
                data: resp
            });
        } catch (error) {
            console.error(error);
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: HttpMessage.INTERNAL_SERVER_ERROR });
        }
    },

    deleteProposalById: async (req, res) => {
        try {
            const userId = req.user.id;
            const proposalId = req.params.id

            const resp = await productService.deleteProposalById(proposalId, userId)

            res.status(HttpStatus.CREATED).json({
                data: resp
            });

        } catch (error) {
            console.error(error);
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: HttpMessage.INTERNAL_SERVER_ERROR });
        }
    },

    getProductUsageStats: async (req, res) => {
        try {
            const { period, from, to } = req.query;

            const result = await productService.fetchProductUsageStats({
                period,
                fromDate: from,
                toDate: to,
            });

            return res.status(200).json({
                success: true,
                message: 'Product usage stats fetched successfully',
                ...result,
            });
        } catch (error) {
            console.error('Error fetching product usage stats:', error);
            return res.status(error.status || 500).json({
                success: false,
                message: error.status ? error.message : 'Failed to fetch product usage stats',
            });
        }
    },

    // createProposals: async (req, res) => {

    //     try {

    //         const userId =
    //             req.user?.id || null;


    //         const result =
    //             await productService.createProposals(
    //                 req.body,
    //                 userId
    //             );


    //         return res.status(201).json({

    //             success: true,

    //             message:
    //                 "Proposal created successfully",

    //             data: result
    //         });


    //     } catch (error) {

    //         console.error(
    //             "createProposal error:",
    //             error
    //         );


    //         return res.status(
    //             error.statusCode || 500
    //         ).json({

    //             success: false,

    //             message:
    //                 error.message ||
    //                 "Failed to create proposal"
    //         });
    //     }
    // },

    // // getProposals: async (req, res) => {

    // //     try {

    // //         const { id } = req.query;
    // //         console.log(id);


    // //         // if (!id) {

    // //         //     return res.status(400).json({
    // //         //         success: false,
    // //         //         message: "Proposal id is required"
    // //         //     });
    // //         // }


    // //         const result =
    // //             await productService.getProposals(id);


    // //         if (!result) {

    // //             return res.status(404).json({
    // //                 success: false,
    // //                 message: "Proposal not found"
    // //             });
    // //         }


    // //         return res.status(200).json({

    // //             success: true,

    // //             message:
    // //                 "Proposal fetched successfully",

    // //             data: result
    // //         });


    // //     } catch (error) {

    // //         console.error(
    // //             "getProposalById error:",
    // //             error
    // //         );


    // //         return res.status(
    // //             error.statusCode || 500
    // //         ).json({

    // //             success: false,

    // //             message:
    // //                 error.message ||
    // //                 "Failed to fetch proposal"
    // //         });
    // //     }
    // // },

    // getProposals: async (req, res) => {

    //     try {

    //         // Query parameter is optional
    //         const { id } = req.query;

    //         console.log("Proposal ID:", id);


    //         // ====================================================
    //         // FETCH DATA
    //         // ====================================================

    //         const result =
    //             await productService.getProposals(id);


    //         // ====================================================
    //         // NO DATA
    //         // ====================================================

    //         if (!result || result.length === 0) {

    //             return res.status(404).json({

    //                 success: false,

    //                 message:
    //                     id
    //                         ? "Proposal not found"
    //                         : "No proposals found",

    //                 data: []
    //             });
    //         }


    //         // ====================================================
    //         // SUCCESS
    //         // ====================================================

    //         return res.status(200).json({

    //             success: true,

    //             message:
    //                 id
    //                     ? "Proposal fetched successfully"
    //                     : "Proposals fetched successfully",

    //             data: result
    //         });


    //     } catch (error) {

    //         console.error(
    //             "getProposals error:",
    //             error
    //         );


    //         return res.status(
    //             error.statusCode || 500
    //         ).json({

    //             success: false,

    //             message:
    //                 error.message ||
    //                 "Failed to fetch proposals"
    //         });
    //     }
    // }






}

module.exports = productController;
