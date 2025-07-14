const dbService = require('../services/database.service');

async function getUserInfo(req, res) {
    try {
        // const tokenContent = req.kauth.grant.access_token.content;
        // const keycloakId = tokenContent.sub;


        const keycloakId = '5ede2850-11cb-44b6-b394-67ea2d711bbe';

        const customerResult = await dbService.query(
            'SELECT customer_id FROM customers WHERE keycloak_user_id = $1',
            [keycloakId]
        );

        if (customerResult.rows.length === 0) {
            return res.status(404).json({ message: 'Customer not found for this Keycloak ID.' });
        }

        const customerId = customerResult.rows[0].customer_id;


        const profileResult = await dbService.query(
            'SELECT profile_id FROM application_profiles WHERE customer_id = $1 ORDER BY created_at DESC LIMIT 1',
            [customerId]
        );

        if (profileResult.rows.length === 0) {
            return res.status(404).json({ message: 'Application profile not found for this customer.' });
        }

        const profileId = profileResult.rows[0].profile_id;

        res.status(200).json({ profileId: profileId, message: 'Profile ID retrieved successfully.' });

    } catch (error) {
        console.error('Error in getUserInfo:', error);
        res.status(500).json({ message: 'Failed to retrieve user information.', error: error.message });
    }
}

module.exports = { getUserInfo };