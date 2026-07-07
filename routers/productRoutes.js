const express = require('express');
const router = express.Router();
const validateRequest = require('../middleware/validateRequest');
const { productData } = require('../validations/validators');
const productController = require('../controllers/productController');
const commController = require('../common/commonControllers');
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');


router.post(
  '/product/addProduct',
  authMiddleware(),
  upload.array("images", 10),
  productController.addProduct
);

// router.post('product/addmoreProduct', authMiddleware(), productController.addMoreProduct)

router.get('/product/getProduct', authMiddleware(), productController.getProduct)

router.get('/product/getInactiveProduct', authMiddleware(), productController.getInactiveProduct)

router.put(
  '/product/updateProduct/:id',
  authMiddleware(),
  upload.array('images'),
  productController.updateProduct
);


router.delete('/product/deleteProduct/:id', authMiddleware(), productController.deleteProductById)

router.delete('/product/activeProduct/:id', authMiddleware(), productController.activeProduct)

router.post('/product/insertProposal', authMiddleware(), productController.createProposal)

router.put('/product/proposal/:id', authMiddleware(), productController.updateProposal);

router.get('/product/wire_type', authMiddleware(), productController.getWireType)

router.get('/product/category_type', authMiddleware(), productController.getCategoryType)

router.get('/product/getproposal', authMiddleware(), productController.getProposalData)

router.get('/product/getproposalById/:id', authMiddleware(), productController.getProposalDataById)

router.get('/product/getproposalByClientId/:client_id', authMiddleware(), productController.getProposalDataByClientId)

router.delete('/product/delete_proposal/:id', authMiddleware(), productController.deleteProposalById)

module.exports = router;

