const bcrypt = require('bcryptjs');
const { userModel } = require('../models/userModel');
const { notificationModel } = require('../models/notificationModel')
const { commDbModel } = require('../common/commonModel')
const jwt = require('jsonwebtoken');

// const { generateOTP, hashOTP } = require('../utils/generateOtp');
const { sendEmailWithCustomFrom } = require('../utils/nodeMailer')
// const {generateOTP, hashOTP} = require('../utils/generateOtp')
const { generateAdminUserSubmissionTemplate } = require('../utils/emailTemplates');
const { notificationTpe } = require('../constants/notificationTypeConstant');
const permissionModel = require('../models/permissionModel');


const adminService = {

  loginUser: async (email_id, password) => {
    try {
      // 1. Check user exists
      const user = await commDbModel.findByEmail(email_id);
      if (!user) {
        return { user: null };
      }

      // 2. Check admin approval status
      const approvalStatus = await userModel.checkApprovalStatus(email_id);

      if (approvalStatus === 'PENDING') {
        return {
          approvalPending: true
        };
      }

      if (approvalStatus !== 'APPROVED') {
        return {
          approvalPending: true
        };
      }

      // 3. Check password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return { user: null };
      }

      // 4. Generate JWT
      const token = jwt.sign(
        {
          id: user.id,
          role_id: user.role_id,
          role_level: user.level
        },
        process.env.JWT_SECRET,
        { expiresIn: '1d' }
      );

      // 5. Fetch permissions
      const permissions = await permissionModel.getUserPermissions(
        user.id,
        user.role_id
      );

      return {
        user,
        token,
        permissions,
        approvalPending: false
      };

    } catch (err) {
      console.error('Login error:', err);
      return { user: null };
    }
  },


  getUserInfo: async (userId) => {
    try {

      const resp = await userModel.getUserInfo(userId)
      return resp;

    } catch (error) {
      console.error('Error fatch user details:', error);
      return {
        success: false,
        message: 'Failed to fatch user details',
        error: error.message,
      };
    }
  },

  updateUserDetails: async (userId, userData) => {
    try {
      // 1. Check if user exists
      const checkUserValid = await userModel.getUserInfo(userId);

      if (!checkUserValid || !checkUserValid.data) {
        return {
          success: false,
          message: 'User not found, cannot update details',
        };
      }

      // 2. Update user details
      const resp = await userModel.updateUserData(userId, userData);

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

  getPermissionUsers: async (logginUserId) => {
    try {
      const resp = await userModel.getPermissionUsers(logginUserId)

      return resp;
    } catch (error) {
      console.error('Error updating user details:', error);
      return {
        success: false,
        message: 'Failed to update user details',
        error: error.message,
      };
    }
  },

  UserDashboard: async (userId) => {
    try {
      const resp = await userModel.getUserDashboard(userId)

      return resp
    } catch (error) {
      console.error('Error updating user Dashboard:', error);
      return {
        success: false,
        message: 'Failed to User Dashboard',
        error: error.message,
      };
    }
  }

}

module.exports = adminService