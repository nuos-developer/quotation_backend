const jwt = require('jsonwebtoken');
const userService = require('../services/userServices');
const { HttpStatus } = require('../constants/httpStatusCodeConstant');
const { HttpMessage } = require('../constants/httpStatusMessageConstant');

const generateToken = (id) =>
    jwt.sign({ id, role: 'user' }, process.env.JWT_SECRET, { expiresIn: '1d' });

const userController = {
    login: async (req, res) => {
        try {
            const { email_id, password } = req.body;

            const result = await userService.loginUser(email_id, password);

            // ❌ Approval pending
            if (result.approvalPending) {
                return res.status(403).json({
                    message: 'Admin approval status is pending'
                });
            }

            // ❌ Invalid credentials
            if (!result.user) {
                return res.status(401).json({
                    message: 'Invalid email or password'
                });
            }

            // ✅ Login success
            return res.json({
                message: 'Login successful',
                token: result.token,
                user: {
                    id: result.user.id,
                    email_id: result.user.email_id,
                    role_id: result.user.role_id,
                    role_level: result.user.level
                },
                permissions: result.permissions
            });

        } catch (error) {
            console.error(error);
            return res.status(500).json({
                message: 'Internal Server Error'
            });
        }
    },


    insertUserDetails: async (req, res) => {
        try {
            const userId = req.params.userId;
            const userData = req.body;
            const result = await userService.insertUserData(userId, userData);

            if (!result.success) {
                return res.status(HttpStatus.BAD_REQUEST).json({ message: result.message });
            }

            res.status(HttpStatus.CREATED).json({ message: result.message, data: result.data, });

        } catch (error) {
            console.error('Error in insertUserDetails:', error);
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: HttpMessage.INTERNAL_SERVER_ERROR });
        }
    },

    getUserInfo: async (req, res) => {
        try {
            const userId = req.params.userId
            const result = await userService.getUserInfo(userId)
            res.status(HttpStatus.CREATED).json({ message: result.message, data: result.data, });
        } catch (error) {
            console.error('Error in insertUserDetails:', error);
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: HttpMessage.INTERNAL_SERVER_ERROR });
        }
    },

    updateUserDetails: async (req, res) => {
        try {
            const userId = req.params.userId;

            const { } = req.body
            console.log('req body :>>>>>>>>>>', req.body, userId);
            const result = await userService.updateUserDetails(userId, req.body)

            res.status(HttpStatus.CREATED).json({ message: result.message, data: result.data, });
        } catch (error) {
            console.error('Error in insertUserDetails:', error);
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: HttpMessage.INTERNAL_SERVER_ERROR });
        }
    },

    getPermissionUsers: async (req, res) => {
        try {

            const logginUserId = req.user.id
            console.log(logginUserId);

            const result = await userService.getPermissionUsers(logginUserId)
            res.status(HttpStatus.CREATED).json({ message: result.message, data: result.data, });

        } catch (error) {
            console.error('Error in insertUserDetails:', error);
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: HttpMessage.INTERNAL_SERVER_ERROR });
        }
    },

    UserDashboard: async (req, res) => {
        try {
            const userId = req.user.id

            const result = await userService.UserDashboard(userId)
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: HttpMessage.INTERNAL_SERVER_ERROR })

        } catch (error) {
            console.error('Error in insertUserDetails:', error);
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: HttpMessage.INTERNAL_SERVER_ERROR });
        }
    }
}



module.exports = userController