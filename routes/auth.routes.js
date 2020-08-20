const {Router} = require('express');
const bcrypt = require('bcryptjs');
const config = require('config');
const jwt = require('jsonwebtoken');
const {check, validationResult} = require('express-validator');
const User = require('../models/User');
const router = Router();

// /api/auth/register
router.post(
    '/register',
    [
        check('email', 'Incorrect email').isEmail(),
        check('password', 'Minimal pwd length is 6 symbols')
            .isLength({min: 6})
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);

            if (!errors.isEmpty()) {
                return res.status(400).json({
                    errors: errors.array(),
                    message: 'Incorrect data while registering'
                })
            }

            const {email, password} = req.body;
            const candidate = await User.findOne({ email });

            if (candidate) {
                return res.status(400).json({
                    message: "Such user is already exist"
                });
            }

            const hashedPwd = await bcrypt.hash(password, 12);
            const user = new User({
                email: email,
                password: hashedPwd
            });
            await User.save();

            res.status(201).json({
                message: 'User has been created'
            });
        } catch(e) {
            res.status(500).json({
                message: 'Smth went wrong'
            })
        }
    }
)

// /api/auth/login
router.post(
    '/login',
    [
        check('email', 'Enter correct email').normalizeEmail().isEmail(),
        check('password', 'Enter the password').exists()
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);

            if (!errors.isEmpty()) {
                return res.status(400).json({errors: errors.array(), message: 'Incorrect data in signing in'})
            }

            const {email, password} = req.body;
            const user = await User.findOne({email});

            if (!user) {
                return res.status(400).json({message: 'User not found'})
            }

            const isMatch = bcrypt.compare(password, user.password);

            if (!isMatch) {
                return res.status(400).json({message: 'Password is wrong'})
            }

            const token = jwt.sign(
                {userId: user.id},
                config.get('jwtSecret'),
                {expiresIn: '1h'}
            )

            res.json({token, userId: user.id});
        } catch(e) {
            res.status(500).json({
                message: 'Smth went wrong'
            })
        }
    }
)

module.exports = router;
