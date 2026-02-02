const bcrypt = require('bcryptjs');
const { dbModel } = require('../models/adminModel');
const jwt = require('jsonwebtoken');
const { commDbModel } = require('../common/commonModel');
const { generateOTP, hashOTP } = require('../utils/generateOtp');
const { sendEmail } = require('../utils/nodeMailer')
// const {generateOTP, hashOTP} = require('../utils/generateOtp')
const { generateAccessGrantedEmailTemplate, generateAdminRoleRequestTemplate } = require('../utils/emailTemplates');
const { sendEmailWithCustomFrom } = require('../utils/nodeMailer')
const { canManage } = require('../utils/roleHierarchy');
const {notificationType} = require('../constants/notificationTypeConstant')
const { notificationModel } = require('../models/notificationModel')

const adminService = {
    registerAdmin: async (reqBody) => {
        try {
            /* ---------------- 1. CHECK MOBILE NUMBER ---------------- */
            const existingUser = await dbModel.checkUserByMobNum(
                reqBody.mobile_number, reqBody.email_id
            );

            if (existingUser) {
                return {
                    success: false,
                    message: 'Mobile Number OR Email Id already Register'
                };
            }

            /* ---------------- 2. REGISTER USER ---------------- */
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(reqBody.password, salt);

            const user = await dbModel.register(reqBody, salt, hashedPassword);

            if (!user?.id) {
                throw new Error('User registration failed');
            }

            /* ---------------- 3. SEND ADMIN EMAIL ---------------- */
            const userFullName = `${reqBody.first_name} ${reqBody.last_name}`;

            const adminEmail = process.env.ADMIN_EMAIL;
            const subject = `New User Role Request – ${userFullName}`;
            const emailHtml = generateAdminRoleRequestTemplate(
                userFullName,
                reqBody.email_id,
                reqBody.mobile_number,
                reqBody.role_name
            );

            const emailSent = await sendEmailWithCustomFrom(
                reqBody.email_id,
                adminEmail,
                subject,
                emailHtml
            );

            /* ---------------- 4. STORE EMAIL LOG ---------------- */
            if (emailSent) {
                await notificationModel.insertEmailbyUserId(
                    reqBody.email_id,      // userEmail
                    subject,   
                    emailHtml,            // subject
                    user.id,               // userId
                    notificationType.NEW_USER_ROLE_REQUEST
                );
            }

            /* ---------------- 5. SUCCESS RESPONSE ---------------- */
            return {
                success: true,
                message: 'User registered successfully. Request sent to admin for approval.'
            };

        } catch (error) {
            console.error('Error registering user:', error);
            return {
                success: false,
                message: 'Failed to register user',
                error: error.message
            };
        }
    },

    verifyOtp: async (otpId, otpInput) => {
        try {
            const otpRecord = await commDbModel.getOtp(otpId);
            if (!otpRecord) {
                return { success: false, message: 'No OTP found for this user.' };
            }
            const { id, otp_hash, expires_at } = otpRecord;
            const now = new Date();
            if (expires_at < now) {
                return { success: false, message: 'OTP has expired.' };
            }
            const hashedInputOtp = hashOTP(otpInput);
            if (hashedInputOtp !== otp_hash) {
                return { success: false, message: 'Invalid OTP.' };
            }
            return {
                success: true,
                message: 'OTP verified successfully!',
                // data: updateResult.data
            };

        } catch (error) {
            console.error('Error verifying OTP:', error);
            return {
                success: false,
                message: 'Failed to verify OTP.',
                error: error.message,
            };
        }
    },

    loginAdmin: async (email_id, password) => {
        const admin = await commDbModel.findByEmail(email_id);
        console.log('admin :>>>>>>>', admin);

        if (!admin) return { admin: null };
        await dbModel.updateLoginStatus(admin.id)
        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) return { admin: null };

        const token = jwt.sign(
            {
                id: admin.id,
                role_id: admin.role_id,
                role_level: admin.level   // 🔥 REQUIRED
            },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );
        console.log(token);
        return { admin, token };
    },

    getUsers: async () => {
        try {
            const resp = await dbModel.getUsers();

            return {
                success: true,
                message: 'Get User sucesfull ',
                data: resp.data || resp,
            };

        } catch (error) {
            return {
                success: false,
                message: 'Failed To User fatch',
                error: error.message,
            };
        }
    },

    logOutUser: async (userId, reqBody) => {
        try {
            const resp = await dbModel.logOutUser(userId, reqBody)

            return {
                success: true,
                message: 'User Logout Sucesfull ',
                data: resp.data || resp,
            };
        } catch (error) {
            return {
                success: false,
                message: 'Failed To Logout User',
                error: error.message,
            };
        }
    },


    assignPartnerRole: async (payload, admin) => {
        try {
            
            const { user_id, role_id, permissions } = payload;
            const userData = await dbModel.getUserById(user_id)

            // if (!user_id || !role_id || !Array.isArray(modules)) {
            //     throw new Error('Invalid payload');
            // }
            const isAssignpermission = await dbModel.assignPartnerRoleBulk(
                user_id,
                role_id,
                permissions,
                admin.id
            );
                const isApprove = await dbModel.approvePermissiopn(role_id, user_id, admin.id, payload.is_admin_approve)
    
                const userEmail = userData.email_id;
                const toMailId = process.env.ADMIN_EMAIL;
                const subject = `${userData.first_name} Permission Approved`;
                const emailHtml = generateAccessGrantedEmailTemplate(userData.first_name, userData.email_id,);
    
                const sendmail = await sendEmailWithCustomFrom(toMailId, userEmail, subject, emailHtml);
    
                console.log(sendEmail);
                
    
    
                if (sendmail) {
                    const insertemaildata = await notificationModel.insertEmailbyUserId(userEmail, subject, emailHtml, user_id, notificationType.APPROVE_ACCESS_LEVEL)
                }
            return { message: 'Permissions assigned successfully' };
        } catch (error) {
            console.error(error)
        }


    },



    getUserPermissions: async (userId, admin) => {
        const targetUser = await dbModel.getUserById(userId);

        // // 🔐 Hierarchy check
        // if (admin.role_level >= targetUser.role_level) {
        //     throw new Error('You cannot view this user permissions');
        // }

        return await dbModel.fetchPermission(userId);
    },


  getDashboardSummary: async () => {
    const data = await dbModel.getDashboardCounts();

    return {
      success: true,
      message: 'Admin dashboard data fetched successfully',
      data
    };
  },


    updateUserPermission: async (payload, userId) => {
        await dbModel.updateUserPermission(payload, userId);
        return { message: 'Permission updated successfully' };
    }

};

module.exports = adminService;
