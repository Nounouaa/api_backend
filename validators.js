const { body } = require('express-validator');

exports.partnerValidators = {
  login: [
    body('email').isEmail().normalizeEmail(),
    body('motDePasse').isLength({ min: 8 })
  ],
  create: [
    body('nomStructure').notEmpty().trim(),
    body('email').isEmail().normalizeEmail(),
    body('motDePasse').isLength({ min: 8 }),
    body('servicePropose').notEmpty(),
    body('presentationLibre').notEmpty()
  ]
};