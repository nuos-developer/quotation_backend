const express = require('express');
const router = express.Router();
const validateRequest = require('../middleware/validateRequest');
const authMiddleware = require('../middleware/authMiddleware')
const { userLoginSchema, userDataValidation } = require('../validations/validators');
const userController = require('../controllers/userController');
const commonController = require('../common/commonControllers'); 
const adminController = require('../controllers/adminController');

// Public routes

router.post('/login', validateRequest(userLoginSchema), userController.login);

router.get('/get_user_info/:userId', authMiddleware(), userController.getUserInfo)

router.put('/update_user_details/:userId', authMiddleware(), userController.updateUserDetails)

router.get('/get_permission_data', authMiddleware(), userController.getPermissionUsers)

router.get('/dashboard', authMiddleware(), userController.UserDashboard)

router.post('/forgetPassword', commonController.forgetPassword);

router.post('/changePassword/:userId', commonController.changePassword)

router.put('/verify/:otpId',adminController.verifyOtp)


// Common routes
router.get('/roles',commonController.getRoles)

router.get('/get_partner',  commonController.getPartners);

router.get('/get_continent',commonController.getContinent )

router.get('/get_country/:continentId',commonController.getCountry )

router.get('/get_zone/:countryId',commonController.getZone )

router.get('/get_state/:zoneId', commonController.getStates)

router.get('/get_devision/:stateId',commonController.getCities)

router.get('/get_channels',commonController.getChannels )



module.exports = router;
