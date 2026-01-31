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
            console.log('image url :.1111111', imageUrls);
            
            reqBody.image_urls = imageUrls;
            
            console.log(reqBody, userId);
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

    updateProduct: async (req, res) => {
        try {
            const productId = req.params.id;
            const reqBody = req.body;
            const userId = req.user.id;
            console.log('req.body :..................', req);

            const resp = await productService.updateProduct(productId, reqBody, userId);

            res.status(HttpStatus.CREATED).json({
                data: resp
            });

        } catch (error) {
            console.error(error);
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: HttpMessage.INTERNAL_SERVER_ERROR });
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

            console.log(':>>>>>>>>>>>>>>>', reqBody, userId);
            const resp = await productService.createProposal(reqBody, userId)

            res.status(HttpStatus.CREATED).json({
                data: resp
            });

        } catch (error) {
            console.error(error);
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: HttpMessage.INTERNAL_SERVER_ERROR });
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
            console.error(error);
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: HttpMessage.INTERNAL_SERVER_ERROR });
        }
    },
    getProposalDataById: async (req, res) => {
        try {
            const proposalId = req.params.id
            const userId = req.user.id
            console.log('req.user.id:>>>>>>>>>>>>>>>', req.params.id);
            const resp = await productService.getProposalDataById(proposalId, userId)
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
            console.log('proposal details:>>>>>>>>>>>>>>>', reqBody, proposalId);

            const resp = await productService.deleteProposalById(proposalId, userId)

            res.status(HttpStatus.CREATED).json({
                data: resp
            });

        } catch (error) {
            console.error(error);
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: HttpMessage.INTERNAL_SERVER_ERROR });
        }
    }

}

module.exports = productController;
