const express = require('express');
const router = express.Router();
const validateRequest = require('../middleware/validateRequest');
const { adminRegisterSchema, adminLoginSchema, rolePermission} = require('../validations/validators');
const adminController = require('../controllers/adminController');
const commController = require('../common/commonControllers');
const authMiddleware = require('../middleware/authMiddleware');

// Public routes
router.post('/register', validateRequest(adminRegisterSchema), adminController.register);

router.post('/verify_email', commController.verifyEmail);

router.put('/verify/:otpId',adminController.verifyOtp)

router.post('/admin_login', validateRequest(adminLoginSchema), adminController.login);  

router.get('/getUsers', authMiddleware(), adminController.getUsers)

router.post('/logout', authMiddleware(), adminController.logoutUser)

router.get('/getModule', authMiddleware(), commController.getModules)

router.get('/roles', authMiddleware(), commController.getRoles)


router.post(
  '/assign_access',
  authMiddleware(),
//   validateRequest(rolePermission),
  adminController.assignPartnerAccess
);

router.get(
  '/permissions/:userId',
  authMiddleware(),
  adminController.getPermissionDetails
);

router.put('/user-permission/:userId', authMiddleware(), adminController.updateUserPermission);

router.get(
  '/dashboard',
  authMiddleware(),
  adminController.getDashboard
);




module.exports = router;
