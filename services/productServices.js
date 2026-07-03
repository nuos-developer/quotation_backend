const { productModel } = require('../models/productsModel');
const { commDbModel } = require('../common/commonModel');

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
    }
}


module.exports = productService;