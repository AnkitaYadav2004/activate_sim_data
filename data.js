const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg'); // Assuming PostgreSQL

const app = express();
const pool = new Pool({ /* database config */ });

app.use(bodyParser.json());

app.post('/activate-sim', async (req, res) => {
    const { iccId, userId } = req.body;

    try {
        // Validate user and SIM card
        const user = await pool.query('SELECT * FROM Users WHERE user_id = $1', [userId]);
        const simCard = await pool.query('SELECT * FROM SIM_Cards WHERE icc_id = $1', [iccId]);

        if (user.rows.length === 0 || simCard.rows.length === 0) {
            return res.status(400).json({ message: 'Invalid user or SIM card.' });
        }

        // Check if SIM card is already active
        if (simCard.rows[0].status === 'active') {
            return res.status(400).json({ message: 'SIM card already activated.' });
        }

        // Activate SIM card
        await pool.query('UPDATE SIM_Cards SET status = $1, user_id = $2 WHERE icc_id = $3', ['active', userId, iccId]);
        res.status(200).json({ message: 'SIM card activated successfully.' });

        // Send confirmation notification (pseudo-code)
        // sendNotification(user.rows[0].email, 'Your SIM card has been activated.');

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'An error occurred.' });
    }
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
