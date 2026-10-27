var express = require('express');
var router = express.Router();
var sequelize = require('../utils/db.utils');
var bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');

const SECRET = 'RBAC12456';

router.post('/register', async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        const hashedPassword = await bcrypt.hash(password, 10);

        const query = `
            INSERT INTO users (name, email, password, role)
            VALUES ($1, $2, $3, $4)
            RETURNING id, name, email, role
        `;

        const result = await sequelize.query(query, {
            bind: [name, email, hashedPassword, role],
            type: sequelize.QueryTypes.INSERT
        });

        res.status(200).json({
            success: true,
            user: result[0][0]
        });

    } catch (err) {
        console.log(err);
        res.status(500).json({ error: err.message });
    }
});


router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const query = `SELECT * FROM users WHERE email = $1`;
        const users = await sequelize.query(query, {
            bind: [email],
            type: sequelize.QueryTypes.SELECT
        });

        const user = users[0];
        if (!user) {
            return res.json({ success: false, message: 'User not found' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.json({ success: false, message: 'Incorrect password' });
        }

    
        const token = jwt.sign(
            {
                id: user.id,
                role: user.role
            },
            SECRET,
            { expiresIn: '8h' }
        );

        res.json({
            success: true,
            message: 'Login successful',
            token
        });

    } catch (e) {
        console.error(e);
        res.status(500).json({ error: e.message });
    }
});


        

module.exports = router;
