const { Pool } = require("pg");
const postgresConfig = require("../config").db;

console.log("🐘 Khởi tạo kết nối đến PostgreSQL...");

const pool = new Pool(postgresConfig);

pool.on("error", (err, client) => {
  console.error("Lỗi không mong muốn trên client PostgreSQL", err);
  process.exit(-1);
});

/**
 * Lưu thông tin sản phẩm được gợi ý vào bảng recommendations.
 * @param {number} applicationId - ID của đơn vay.
 * @param {object} product_id - Đối tượng sản phẩm được gợi ý.
 * @returns {Promise<void>}
 */
/**
 * Lưu gợi ý sản phẩm vào cơ sở dữ liệu.
 * @param {number} applicationId - ID của đơn vay.
 * @param {object} productData - Object chứa thông tin sản phẩm, ví dụ: { product_id: 5, product: '...' }.
 */
async function saveRecommendation(applicationId, productData) {
  const productIdToSave = productData.product_id;

  if (productIdToSave === undefined) {
    console.error(
      "Lỗi: Dữ liệu sản phẩm không hợp lệ, không tìm thấy product_id.",
      productData
    );
    throw new Error("Dữ liệu sản phẩm không hợp lệ.");
  }

  const query = `
        INSERT INTO recommendations (application_id, product_id)
        VALUES ($1, $2);
    `;

  try {
    await pool.query(query, [applicationId, productIdToSave]);
    console.log(
      `✅ Đã lưu gợi ý (Sản phẩm ID: ${productIdToSave}) cho Đơn vay ID: ${applicationId}`
    );
  } catch (error) {
    console.error("Lỗi khi lưu gợi ý sản phẩm vào CSDL:", error);
    throw error;
  }
}
/**
 * Cập nhật trạng thái của một đơn vay.
 * @param {number} applicationId - ID của đơn vay cần cập nhật.
 * @param {string} newStatus - Trạng thái mới (phải là một trong các giá trị của ENUM application_status).
 * @returns {Promise<void>}
 */
async function updateApplicationStatus(applicationId, newStatus) {
  const query = `
        UPDATE loan_applications
        SET status = $1, updated_at = NOW()
        WHERE application_id = $2;
    `;
  try {
    await pool.query(query, [newStatus, applicationId]);
    console.log(
      `✅ Đã cập nhật trạng thái của đơn vay ID ${applicationId} thành: ${newStatus}`
    );
  } catch (error) {
    console.error(
      `Lỗi khi cập nhật trạng thái cho đơn vay ID ${applicationId}:`,
      error
    );
  }
}

module.exports = {
  pool,
  saveRecommendation,
  updateApplicationStatus,
};
