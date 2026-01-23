const commonServices = require('../common/commonSevices')
const { HttpStatus } = require('../constants/httpStatusCodeConstant')
const { HttpMessage } = require('../constants/httpStatusMessageConstant')

const commonController = {

    getPartners: async (req, res) => {
        try {
            const partners = await commonServices.getPartners();

            if (!partners || partners.length === 0) {
                return res.status(HttpStatus.NOT_FOUND).json({ success: false, message: 'No partners found', });
            }
            return res.status(HttpStatus.OK).json({
                success: true, message: 'Partners fetched successfully', data: partners,
            });
        } catch (error) {
            console.error('Error fetching partners:', error);
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                success: false, message: `${HttpMessage.INTERNAL_SERVER_ERROR}`, error: error.message,
            });
        }
    },

    getModules: async (req, res) => {
        try {
            const partners = await commonServices.getModules();

            if (!partners || partners.length === 0) {
                return res.status(HttpStatus.NOT_FOUND).json({ success: false, message: 'No module found', });
            }
            return res.status(HttpStatus.OK).json({
                success: true, message: 'module fetched successfully', data: partners,
            });
        } catch (error) {
            console.error('Error fetching module:', error);
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                success: false, message: `${HttpMessage.INTERNAL_SERVER_ERROR}`, error: error.message,
            });
        }
    },

    getRoles: async (req, res) => {
        try {
            const partners = await commonServices.getRoles();

            if (!partners || partners.length === 0) {
                return res.status(HttpStatus.NOT_FOUND).json({ success: false, message: 'No roles found', });
            }
            return res.status(HttpStatus.OK).json({
                success: true, message: 'roles fetched successfully', data: partners,
            });
        } catch (error) {
            console.error('Error fetching roles:', error);
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                success: false, message: `${HttpMessage.INTERNAL_SERVER_ERROR}`, error: error.message,
            });
        }
    },

    verifyEmail: async (req, res) => {
        try {
            const response = await commonServices.verifyEmailId(req.body);

            if (!response.success) {
                return res.status(HttpStatus.BAD_REQUEST).json({
                    success: false,
                    message: response.message,
                    error: response.error || null,
                });
            }

            return res.status(HttpStatus.OK).json({
                success: true,
                message: response.message,
                data: response.data,
            });

        } catch (error) {
            console.error('Error verifying email:', error);
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: HttpMessage.INTERNAL_SERVER_ERROR,
                error: error.message,
            });
        }
    },
    forgetPassword: async (req, res) => {
        try {
            const response = await commonServices.forgetPassword(req.body);

            if (!response.success) {
                return res.status(HttpStatus.BAD_REQUEST).json({
                    success: false,
                    message: response.message,
                    error: response.error || null,
                });
            }

            return res.status(HttpStatus.OK).json({
                success: true,
                message: response.message,
                data: response.data,
            });

        } catch (error) {
            console.error('Error verifying email:', error);
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: HttpMessage.INTERNAL_SERVER_ERROR,
                error: error.message,
            });
        }
    },

    changePassword : async (req, res)=>{
            try {

                userId = req.params.userId
            const response = await commonServices.changePassword(req.body, userId);

            if (!response.success) {
                return res.status(HttpStatus.BAD_REQUEST).json({
                    success: false,
                    message: response.message,
                    error: response.error || null,
                });
            }

            return res.status(HttpStatus.OK).json({
                success: true,
                message: response.message,
                data: response.data,
            });

        } catch (error) {
            console.error('Error verifying email:', error);
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: HttpMessage.INTERNAL_SERVER_ERROR,
                error: error.message,
            });
        }

    },

    getContinent: async (req, res) => {
        try {
            const partners = await commonServices.getContinents();

            if (!partners || partners.length === 0) {
                return res.status(HttpStatus.NOT_FOUND).json({ success: false, message: 'No continent found', });
            }
            return res.status(HttpStatus.OK).json({
                success: true, message: 'Continent fetched successfully', data: partners,
            });
        } catch (error) {
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: HttpMessage.INTERNAL_SERVER_ERROR,
                error: error.message,
            });
        }
    },
    getCountry: async (req, res) => {
        try {
            const continentId = req.params.continentId
            const partners = await commonServices.getCountries(continentId);

            if (!partners || partners.length === 0) {
                return res.status(HttpStatus.NOT_FOUND).json({ success: false, message: 'No Country found', });
            }
            return res.status(HttpStatus.OK).json({
                success: true, message: 'Country fetched successfully', data: partners,
            });
        } catch (error) {
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: HttpMessage.INTERNAL_SERVER_ERROR,
                error: error.message,
            });
        }
    },
    getZone: async (req, res) => {
        try {
            const countryId= req.params.countryId
            const partners = await commonServices.getZone(countryId);

            if (!partners || partners.length === 0) {
                return res.status(HttpStatus.NOT_FOUND).json({ success: false, message: 'No Regional found', });
            }
            return res.status(HttpStatus.OK).json({
                success: true, message: 'Regional fetched successfully', data: partners,
            });
        } catch (error) {
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: HttpMessage.INTERNAL_SERVER_ERROR,
                error: error.message,
            });
        }
    },
    getStates: async (req, res) => {
        try {
            const zoneId= req.params.zoneId
            const partners = await commonServices.getStates(zoneId);

            if (!partners || partners.length === 0) {
                return res.status(HttpStatus.NOT_FOUND).json({ success: false, message: 'No State found', });
            }
            return res.status(HttpStatus.OK).json({
                success: true, message: 'Regional State successfully', data: partners,
            });
        } catch (error) {
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: HttpMessage.INTERNAL_SERVER_ERROR,
                error: error.message,
            });
        }
    },

    getCities: async (req, res) => {
        try {

            const stateId = req.params.stateId
            console.log('stateId :....',stateId);
            
            const partners = await commonServices.getCities(stateId);

            if (!partners || partners.length === 0) {
                return res.status(HttpStatus.NOT_FOUND).json({ success: false, message: 'No Cities found', });
            }
            return res.status(HttpStatus.OK).json({
                success: true, message: 'City fetched successfully', data: partners,
            });
        } catch (error) {
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: HttpMessage.INTERNAL_SERVER_ERROR,
                error: error.message,
            });
        }
    },

    getChannels: async (req, res) => {
        try {
            const partners = await commonServices.getChannels();

            if (!partners || partners.length === 0) {
                return res.status(HttpStatus.NOT_FOUND).json({ success: false, message: 'No Channels found', });
            }
            return res.status(HttpStatus.OK).json({
                success: true, message: 'Channels fetched successfully', data: partners,
            });
        } catch (error) {
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: HttpMessage.INTERNAL_SERVER_ERROR,
                error: error.message,
            });
        }
    },

}

module.exports = commonController