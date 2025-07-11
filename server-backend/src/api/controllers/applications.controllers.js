const dbService = require('../services/database.service');
const camundaService = require('../services/camunda.service');

async function createApplication(req, res) {
    try {
        // Giả sử có keycloakId từ middleware xác thực
        const keycloakId = 'user-from-keycloak-123';
        const applicationData = req.body;

        const customerId = await dbService.findOrCreateCustomer(keycloakId, applicationData.email, applicationData.name);

        const applicationId = await dbService.createApplicationInDb(applicationData, customerId);

        const processInstance = await camundaService.startProcess(String(applicationId));

        await dbService.updateApplicationWithProcessId(applicationId, processInstance.id);

        res.status(201).json({
            message: 'Application submitted and process started.',
            applicationId: applicationId,
            processInstanceId: processInstance.id,
        });

    } catch (error) {
        console.error('Error creating application:', error);
        res.status(500).json({ message: 'Failed to create application.' });
    }
}

module.exports = { createApplication };