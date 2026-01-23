const { HttpMessage, HttpStatus } = require('../constants/httpStatusCodeConstant')

const validateRequest = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body);
  if (error) return res.status(HttpStatus.BAD_REQUEST).json({ message: error.details[0].message });
  next();
};

module.exports = validateRequest;
