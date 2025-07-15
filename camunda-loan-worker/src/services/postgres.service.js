const { Pool } = require("pg");
const postgresConfig = require("../config").db;

console.log("🐘 Khởi tạo kết nối đến PostgreSQL...");

const pool = new Pool(postgresConfig);

pool.on('error', (err, client) => {
    console.error('Lỗi không mong muốn trên client PostgreSQL', err);
    process.exit(-1);
});


/**
 * Lưu thông tin sản phẩm được gợi ý vào bảng recommendations.
 * @param {number} applicationId - ID của đơn vay.
 * @param {object} product_id - Đối tượng sản phẩm được gợi ý.
 * @returns {Promise<void>}
 */
async function saveRecommendation(applicationId, product_id) {
    const query = `
        INSERT INTO recommendations (application_id, product_id)
        VALUES ($1, $2, $3);
    `;

    try {
        let productId = product_id;
        await pool.query(query, [applicationId, productId]);
        console.log(`✅ Đã lưu gợi ý (Sản phẩm ID: ${productId}) cho Đơn vay ID: ${applicationId}`);
    } catch (error) {
        console.error("Lỗi khi lưu gợi ý sản phẩm vào CSDL:", error);
    }
}

/**
 * Cập nhật trạng thái của một đơn vay.
 * @param {number} applicationId - ID của đơn vay cần cập nhật.
 * @param {string} newStatus - Trạng thái mới (phải là một trong các giá trị của ENUM application_status).
 * @returns {Promise<void>}
 */
async function updateApplicationStatus( applicationId, newStatus) {
    const query = `
        UPDATE loan_applications
        SET status = $1, updated_at = NOW()
        WHERE application_id = $2;
    `;
    try {
        await pool.query(query, [newStatus, applicationId]);
        console.log(`✅ Đã cập nhật trạng thái của đơn vay ID ${applicationId} thành: ${newStatus}`);
    } catch (error) {
        console.error(`Lỗi khi cập nhật trạng thái cho đơn vay ID ${applicationId}:`, error);
    }
}

module.exports = {
    pool,
    saveRecommendation,
    updateApplicationStatus
};
