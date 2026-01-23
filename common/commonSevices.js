const bcrypt = require('bcryptjs');
const { commDbModel } = require('../common/commonModel');
const { generateOTP, hashOTP } = require('../utils/generateOtp');
const { sendEmail } = require('../utils/nodeMailer')
// const {generateOTP, hashOTP} = require('../utils/generateOtp')
const { generateOtpEmailTemplate , generateForgotPasswordOtpTemplate } = require('../utils/emailTemplates');

const commonServices = {

    getPartners: async () => {
        try {
            const partners = await commDbModel._getPartners();
            return partners;
        } catch (error) {
            console.error('Service Error (getPartners):', error);
            throw error;
        }
    },

    getModules: async () => {
        try {
            const partners = await commDbModel._getModules();
            return partners;
        } catch (error) {
            console.error('Service Error (getModules):', error);
            throw error;
        }
    },

    getRoles: async () => {
        try {
            const partners = await commDbModel._getRoles();
            return partners;
        } catch (error) {
            console.error('Service Error (getRoles):', error);
            throw error;
        }
    },

    getContinents: async () => {
        try {
            const partners = await commDbModel._getContinents();
            return partners;
        } catch (error) {
            console.error('Service Error (getPartners):', error);
            throw error;
        }
    },
    getCountries: async (continentId) => {
        try {
            const partners = await commDbModel._getCountries(continentId);
            return partners;
        } catch (error) {
            console.error('Service Error (getCountries):', error);
            throw error;
        }
    },

    getZone: async (countryId) => {
        try {
            const partners = await commDbModel._getZone(countryId);
            return partners;
        } catch (error) {
            console.error('Service Error (_getCountries):', error);
            throw error;
        }
    },
    getStates: async (zoneId) => {
        try {
            const partners = await commDbModel._getStates(zoneId);
            return partners;
        } catch (error) {
            console.error('Service Error (_getStates):', error);
            throw error;
        }
    },

    getCities: async (stateId) => {
        try {
            const partners = await commDbModel._getCities(stateId);
            return partners;
        } catch (error) {
            console.error('Service Error (getCities):', error);
            throw error;
        }
    },

    getChannels: async () => {
        try {
            const partners = await commDbModel._getChannels();
            return partners;
        } catch (error) {
            console.error('Service Error (getChannels):', error);
            throw error;
        }
    },

    verifyEmailId: async (reqBody) => {
        try {
            const otp = generateOTP(); 
            const hashedOtp = hashOTP(otp.toString());

            const subject = `${reqBody.first_name}, here's your OTP to verify your email address on NUOS`;

            console.log('Generated OTP:', otp);
            console.log('Hashed OTP:', hashedOtp);

            // Save OTP (linked to user or email)
           const otpResp =  await commDbModel.saveOtp( hashedOtp);

            // Generate Email HTML
            const emailHtml = generateOtpEmailTemplate(reqBody.first_name, otp);

            // Send OTP Email
            const sendMailResp = await sendEmail(reqBody.email_id, subject, emailHtml);

            // Return API response
            return {
                success: true,
                message: 'OTP sent successfully to your email address.',
                data: {
                    id : otpResp.id,
                    email: reqBody.email_id, 
                    otp:otp,
                    otpSent: true,
                    mailInfo: sendMailResp.messageId || null,
                },
            };

        } catch (error) {
            console.error('Error sending OTP email:', error);
            return {
                success: false,
                message: 'Failed to send OTP email.',
                error: error.message,
            };
        }
    },

    forgetPassword: async (reqBody) => {
        try {
            const otp = generateOTP(); 
            const hashedOtp = hashOTP(otp.toString());

            const subject = `${reqBody.first_name}, here's your OTP to forget your Password on NUOS`;

            console.log('Generated OTP:', otp);
            console.log('Hashed OTP:', hashedOtp);

            // Save OTP (linked to user or email)
            
            // Generate Email HTML
            const emailHtml = generateForgotPasswordOtpTemplate(reqBody.first_name, otp);
            
            // Send OTP Email
            const sendMailResp = await sendEmail(reqBody.email_id, subject, emailHtml);
            
            const otpResp =  await commDbModel.saveOtp( hashedOtp);
            // Return API response
            return {
                success: true,
                message: 'OTP sent successfully to your email address.',
                data: {
                    id : otpResp.id,
                    email: reqBody.email_id, 
                    otp:otp,
                    otpSent: true,
                    mailInfo: sendMailResp.messageId || null,
                },
            };

        } catch (error) {
            console.error('Error sending OTP email:', error);
            return {
                success: false,
                message: 'Failed to send OTP email.',
                error: error.message,
            };
        }
    },


changePassword: async (reqBody, userId) => {
  try {
    const { password, confirm_password } = reqBody;

    if (!password || !confirm_password) {
      return {
        success: false,
        message: 'Password and confirm password are required'
      };
    }

    if (password !== confirm_password) {
      return {
        success: false,
        message: 'Password and confirm password do not match'
      };
    }

    // Generate new salt & hash
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Update password in DB
    const result = await commDbModel.changePassword(userId, hashedPassword, salt);

    if (!result) {
      return {
        success: false,
        message: 'User not found or password not updated'
      };
    }

    return {
      success: true,
      message: 'Password changed successfully'
    };

  } catch (error) {
    console.error('Change Password Service Error:', error);
    return {
      success: false,
      message: 'Failed to change password',
      error: error.message
    };
  }
},


}

module.exports = commonServices