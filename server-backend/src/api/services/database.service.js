const { Pool } = require('pg');
const config = require('../../config');

const pool = new Pool(config.db);

async function findOrCreateCustomer(keycloakId, email, name) {
    const query = `
        INSERT INTO customers (keycloak_user_id, email, full_name)
        VALUES ($1, $2, $3)
        ON CONFLICT (keycloak_user_id) DO UPDATE SET
            email = EXCLUDED.email,
            full_name = EXCLUDED.full_name
        RETURNING customer_id;
    `;
    const { rows } = await pool.query(query, [keycloakId, email, name]);
    return rows[0].customer_id;
}


/**
 * Tìm khách hàng bằng keycloakId và lấy thông tin chi tiết từ đơn vay gần nhất của họ.
 * @param {string} keycloakId - ID của người dùng từ Keycloak.
 * @returns {Promise<object|null>} Trả về một đối tượng chứa toàn bộ thông tin, hoặc null nếu không tìm thấy.
 */
/**
 * Tìm khách hàng bằng keycloakId và lấy thông tin từ profile tài chính gần nhất của họ.
 * @param {string} keycloakId - ID của người dùng từ Keycloak.
 * @returns {Promise<object|null>} Trả về một đối tượng chứa thông tin customer và profile, hoặc null nếu không tìm thấy.
 */
async function findCustomerWithLatestProfile(keycloakId) {
    const query = `
        SELECT
            c.customer_id,
            c.full_name,
            c.email,
            
            p.profile_id,
            p.age,
            p.income,
            p.home_ownership,
            p.employment_length_years,
            p.default_on_file,
            p.credit_history_length_years,
            p.loan_amount,
            p.loan_intent,
            p.loan_grade,
            p.interest_rate,
            p.loan_term,
            p.percent_income,
            p.created_at AS profile_created_at

        FROM 
            customers c
        LEFT JOIN 
            application_profiles p ON c.customer_id = p.customer_id
        WHERE 
            c.keycloak_user_id = $1
        ORDER BY 
            p.created_at DESC -- Sắp xếp để lấy profile mới nhất
        LIMIT 1;
    `;

    try {
        const { rows } = await pool.query(query, [keycloakId]);
        return rows[0] || null;
    } catch (error) {
        console.error("Lỗi khi tìm khách hàng và profile:", error);
        throw error;
    }
}



async function createApplicationProfile(customerId, profileData) {
    const {
        age, income, home_ownership, employment_length_years,
        default_on_file, credit_history_length_years
    } = profileData;

    const query = `
        INSERT INTO application_profiles 
            (customer_id, age, income, home_ownership, employment_length_years, default_on_file, credit_history_length_years)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING profile_id;
    `;
    const { rows } = await pool.query(query, [
        customerId, age, income, home_ownership, employment_length_years,
        default_on_file, credit_history_length_years
    ]);
    return rows[0].profile_id;
}


/**
 * Kiểm tra xem khách hàng có đơn vay nào đang hoạt động không (PENDING hoặc IN_REVIEW).
 * @param {number} customerId - ID của khách hàng.
 * @returns {Promise<object|null>} Trả về thông tin đơn vay nếu có, ngược lại trả về null.
 */
async function findActiveApplicationByCustomerId(customerId) {
    const query = `
        SELECT application_id, status, created_at FROM loan_applications
        WHERE customer_id = $1 AND status IN ('PENDING', 'IN_REVIEW')
        ORDER BY created_at DESC
        LIMIT 1;
    `;
    const { rows } = await pool.query(query, [customerId]);
    return rows[0] || null;
}

/**
 * Tạo một bản ghi loan_application mới để theo dõi trạng thái quy trình.
 * @param {number} customerId - ID của khách hàng.
 * @param {number} profileId - ID của profile tài chính vừa được tạo.
 * @returns {Promise<number>} ID của đơn vay vừa được tạo.
 */
async function createLoanApplication(customerId, profileId) {
    const query = `
        INSERT INTO loan_applications (customer_id, profile_id, status)
        VALUES ($1, $2, 'PENDING')
        RETURNING application_id;
    `;

    const { rows } = await pool.query(query, [customerId, profileId]);
    return rows[0].application_id;
}


async function updateApplicationWithProcessId(applicationId, processInstanceId) {
    const query = `
        UPDATE loan_applications SET camunda_process_instance_id = $1, updated_at = NOW()
        WHERE application_id = $2;
    `;
    await pool.query(query, [processInstanceId, applicationId]);
}

module.exports = {
    pool,
    findOrCreateCustomer,
    createApplicationProfile,
    createLoanApplication,
    updateApplicationWithProcessId,
    findCustomerWithLatestProfile,
    findActiveApplicationByCustomerId
};