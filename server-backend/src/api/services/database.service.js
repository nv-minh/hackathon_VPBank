const { Pool } = require('pg');
const config = require('../../config');

const pool = new Pool(config.db);


async function createApplicationInDb(applicationData, customerId) {
    const query = `
    INSERT INTO loan_applications (customer_id, application_data, status)
    VALUES ($1, $2, 'PENDING')
    RETURNING id;
  `;
    const { rows } = await pool.query(query, [customerId, applicationData]);
    return rows[0].id;
}

async function findOrCreateCustomer(keycloakId, email, name) {
    // Logic tìm hoặc tạo customer, trả về customer.id
    // Tạm thời bỏ qua để đơn giản
    return 1; // Giả sử trả về ID = 1
}

async function updateApplicationWithProcessId(applicationId, processInstanceId) {
    const query = `
        UPDATE loan_applications
        SET camunda_process_instance_id = $1, updated_at = NOW()
        WHERE id = $2;
    `;
    await pool.query(query, [processInstanceId, applicationId]);
}


module.exports = {
    pool,
    createApplicationInDb,
    findOrCreateCustomer,
    updateApplicationWithProcessId,
};