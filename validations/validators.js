const Joi = require('joi');

exports.adminRegisterSchema = Joi.object({
  first_name: Joi.string().required(),
  last_name: Joi.string().required(),
  user_name: Joi.string().required(),
  role_name: Joi.string().required(),
  email_id: Joi.string().email().required(),
  mobile_number: Joi.string().min(10).required(),
  password: Joi.string()
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=(?:.*\d){2,3})(?=.*[!@#$%^&*()_+{}\[\]:;"'<>,.?/]).{8,}$/)
    .message('Password must have 1 uppercase, 1 lowercase, 2-3 numbers, 1 special char, min 8 chars')
    .required(),
  address: Joi.string().required(),
  pin_code: Joi.string().required(),
  country: Joi.string().required(),
  state: Joi.string().required(),
  district: Joi.string().required(),
  taluk: Joi.string().optional(),
  division: Joi.string().optional(),
  region: Joi.string().optional(),
  company_name: Joi.string().optional(),
  gst_name: Joi.string().optional(),
  company_address: Joi.string().optional(),
});

exports.adminLoginSchema = Joi.object({
  email_id: Joi.string().email().required(),
  password: Joi.string().required()
});

exports.userLoginSchema = Joi.object({
  email_id: Joi.string().email().required(),
  password: Joi.string().required()
});

exports.otpValidate = Joi.object({
  otp: Joi.number().required()
})


exports.userDataValidation = Joi.object({
  partner_id: Joi.number().required(),
  address: Joi.string().required(),
  pin_code: Joi.string().required(),
  country: Joi.string().required(),
  state: Joi.string().required(),
  district: Joi.string().required(),
  taluk: Joi.string().optional(),
  division: Joi.string().optional(),
  region: Joi.string().optional(),
  company_name: Joi.string().optional(),
  gst_name: Joi.string().optional(),
  company_address: Joi.string().optional(),
})

exports.rolePermission = Joi.object({
  user_id: Joi.number().required(),
  partner_type_id: Joi.number().required(),
  continent_id: Joi.number().optional(),
  country_id: Joi.number().optional(),
  zone_id: Joi.number().optional(),
  state_id: Joi.number().optional(),
  city_id: Joi.number().optional(),
  channel_id: Joi.number().optional(),
  access_level: Joi.number().optional(),
  is_active: Joi.number().optional(),
})

exports.productData = Joi.object({
  product_name: Joi.string().max(150).required(),
  category: Joi.string().max(150).required(),
  mod_size: Joi.number().optional(),
  price: Joi.number().required(),
  // wiring_type_id: Joi.string().optional(),
  wiring_type: Joi.string().max(150).optional(),
  zigbee_type: Joi.string().max(150).optional(),
});


