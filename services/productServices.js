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

    updateProduct: async (productId, reqBody, userId) => {
        try {
            // 1. Check if product exists
            const checkProductValid = await productModel.getProductBypId(productId, reqBody, userId);

            console.log('checkProduct :>>>>>>>', checkProductValid);


            if (!checkProductValid || !checkProductValid.data) {
                return {
                    success: false,
                    message: 'Product not found, cannot update details',
                };
            }

            // 2. Update user details
            const resp = await productModel.updateProduct(productId, reqBody, userId);

            return {
                success: true,
                message: 'User details updated successfully',
                data: resp.data || resp, // return updated record if available
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
            console.error('Error updating Product:', error);
            return {
                success: false,
                message: 'Failed to update Product',
                error: error.message,
            };
        }
    },

    createProposal: async (reqBody, userId) => {
        try {
            console.log('product :>>>>>>>>>>>>', reqBody.floors);

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
                message: 'Failed to update proposal',
                error: error.message,
            };
        }
    },

    getProposalData: async (userId) => {
        try {

            const resp = await productModel.getProposalData(userId)
            console.log('resp :>>>>>>>>>',resp );
            
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
            console.log('resp :>>>>>>>>',resp);
            
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