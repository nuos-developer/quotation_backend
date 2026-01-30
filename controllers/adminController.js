const jwt = require('jsonwebtoken');
const adminService = require('../services/adminServices');
const { HttpStatus } = require('../constants/httpStatusCodeConstant');
const { HttpMessage } = require('../constants/httpStatusMessageConstant');

const generateToken = (id) =>
    jwt.sign({ id, role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '1d' });

const adminController = {
    register: async (req, res) => {
        try {
            const resp = await adminService.registerAdmin(req.body);
            res.status(HttpStatus.CREATED).json({ message: `${req.body.role} ${HttpMessage.CREATED}`, resp });
        } catch (err) {
            console.error(err);
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: HttpMessage.INTERNAL_SERVER_ERROR });
        }
    },

    verifyOtp: async (req, res) => {
        try {
            const otpId = req.params.otpId;
            const { otp } = req.body;
            if (!otp) {
                return res.status(HttpStatus.BAD_REQUEST).json({ success: false, message: 'OTP is required' });
            }
            const verifyResult = await adminService.verifyOtp(otpId, otp);
            if (!verifyResult.success) {
                return res.status(HttpStatus.BAD_REQUEST).json(verifyResult);
            }
            res.status(HttpStatus.OK).json({ message: 'OTP Verify Successfully' });
        } catch (error) {
            console.error('Error in verifyOtp controller:', error);
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: HttpMessage.INTERNAL_SERVER_ERROR,
                error: error.message
            });
        }
    },

    login: async (req, res) => {
        try {
            console.log('admin:>>>>>>>',req.body);

            const { email_id, password } = req.body;
            const { admin, token } = await adminService.loginAdmin(email_id, password);
            if (!admin) {
                return res.status(HttpStatus.UNAUTHORIZED).json({ message: 'Invalid email or password' });
            }
            res.json({ message: 'Admin Login successful', token, admin: { email_id: admin.email_id }, });
        } catch (err) {
            console.error(err);
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: HttpMessage.INTERNAL_SERVER_ERROR });
        }
    },

    // assignPartnerAccess: async (req, res) => {
    //     try {
    //         const adminId = req.user.id;  // from JWT middleware
    //         const reqBody = req.body;
    //         console.log(adminId, reqBody);
    //         const insertedRow = await adminService.assignPartnerRole(reqBody, adminId);

    //         return res.status(201).json({
    //             success: true,
    //             message: 'Partner role assigned successfully',
    //             data: insertedRow
    //         });

    //     } catch (error) {
    //         console.error(error);
    //         return res.status(500).json({
    //             success: false,
    //             message: 'Failed to assign partner role',
    //             error: error.message
    //         });
    //     }
    // },

    // getPermissionDetails: async (req, res) => {
    //     try {
    //         const userId = req.params.userId
    //         const adminId = req.user.id;  // from JWT middleware
    //         // const reqBody = req.body;

    //         console.log(userId, adminId);


    //         const result = await adminService.getPermissionDetails(userId, adminId)
    //         res.status(HttpStatus.CREATED).json({ message: result.message, data: result.data, });
    //     } catch (error) {
    //         console.error('Error in ("getPermissionDetails"):', error);
    //         res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: HttpMessage.INTERNAL_SERVER_ERROR });
    //     }
    // },

    // updateUserPermission: async (req, res) => {
    //     try {
    //         const userId = req.params.userId
    //         const reqBody = req.body
    //         const result = await adminService.updateUserPermission(reqBody, userId)
    //         res.status(HttpStatus.CREATED).json({ message: result.message, data: result.data, });

    //     } catch (error) {
    //         console.error('Error in ("updateUserPermission"):', error);
    //         res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: HttpMessage.INTERNAL_SERVER_ERROR });
    //     }
    // },

    getUsers: async (req, res) => {
        try {

            const adminId = req.user.id
            const result = await adminService.getUsers()
            res.status(HttpStatus.CREATED).json({ message: result.message, data: result.data, });

        } catch (error) {
            console.error('Error in ("getUsers"):', error);
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: HttpMessage.INTERNAL_SERVER_ERROR });
        }
    },

    logoutUser: async (req, res) => {
        try {
            const userId = req.user.id
            const reqBody = req.body

            const result = await adminService.logOutUser(userId, reqBody)
            res.status(HttpStatus.CREATED).json({ message: result.message, data: result.data, });
        } catch (error) {
            console.error('Error in ("logoutUser"):', error);
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: HttpMessage.INTERNAL_SERVER_ERROR });
        }
    },

    assignPartnerAccess: async (req, res) => {
        try {
            
            const admin = req.user;
            const result = await adminService.assignPartnerRole(req.body, admin);

            res.status(201).json({
                success: true,
                message: 'Permission assigned successfully',
                data: result
            });
        } catch (err) {
            res.status(500).json({ success: false, message: err.message });
        }
    },

    getPermissionDetails: async (req, res) => {
        try {
            const result = await adminService.getUserPermissions(
                req.params.userId,
                req.user.id
            );
            res.status(200).json(result);
        } catch (err) {
            res.status(500).json({ message: err.message });
        }
    },

   getDashboard: async (req, res) => {
    try {
      const result = await adminService.getDashboardSummary();
      res.status(HttpStatus.OK).json(result);
    } catch (error) {
      console.error('Dashboard error:', error);
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Failed to fetch dashboard data'
      });
    }
  },

    updateUserPermission: async (req, res) => {
        const result = await adminService.updateUserPermission(req.body, req.params.userId);
        res.json(result);
    }


};


module.exports = adminController;
