// body holds the data sent in the request body, validationResult is used to check for validation errors
import { body, validationResult } from 'express-validator';

// function meant to be used for user routes and to validate request body before running the route handler
function validateEmailAndPassword(req, res, next) {
    const emailValidation = body('email')
        .trim()
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Invalid email format')
        .normalizeEmail();

    const passwordValidation = body('password')
        .trim()
        .notEmpty().withMessage('Password is required')
        .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long');
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
}

export default validateEmailAndPassword;