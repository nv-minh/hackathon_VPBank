const { Pool } = require("pg");
const config = require("../../config");

const pool = new Pool(config.db);

/**
 * Tìm một khách hàng bằng keycloak_user_id. Nếu không tìm thấy, tạo một khách hàng mới.
 * @param {string} keycloakId - ID người dùng từ Keycloak.
 * @param {string} fullName - Tên đầy đủ từ token Keycloak.
 * @param {string} email - Email từ token Keycloak.
 * @returns {Promise<number>} Trả về customer_id của khách hàng hiện có hoặc khách hàng mới.
 */
async function findOrCreateCustomer(keycloakId, fullName, email) {
  const selectQuery =
    "SELECT customer_id FROM customers WHERE keycloak_user_id = $1";
  const { rows } = await pool.query(selectQuery, [keycloakId]);

  if (rows.length > 0) {
    console.log(
      `Khách hàng với keycloakId ${keycloakId} đã tồn tại. ID: ${rows[0].customer_id}`
    );
    return rows[0].customer_id;
  } else {
    console.log(`Tạo khách hàng mới cho keycloakId ${keycloakId}.`);
    const insertQuery = `
        INSERT INTO customers (keycloak_user_id, full_name, email)
        VALUES ($1, $2, $3)
        RETURNING customer_id;
      `;
    const insertResult = await pool.query(insertQuery, [
      keycloakId,
      fullName,
      email,
    ]);
    return insertResult.rows[0].customer_id;
  }
}

/**
 * Tạo một hồ sơ ứng tuyển (chỉ chứa các thông tin ban đầu).
 * @param {number} customerId - ID của khách hàng.
 * @param {object} profileData - Dữ liệu hồ sơ.
 * @returns {Promise<number>} Trả về profile_id của hồ sơ vừa tạo.
 */
// async function createApplicationProfile(customerId, profileData) {
//   const {
//     age,
//     income,
//     home_ownership,
//     employment_length_years,
//     default_on_file,
//     credit_history_length_years,
//   } = profileData;

//   const query = `
//         INSERT INTO application_profiles
//             (customer_id, age, income, home_ownership, employment_length_years, default_on_file, credit_history_length_years)
//         VALUES ($1, $2, $3, $4, $5, $6, $7)
//         RETURNING profile_id;
//     `;
//   const { rows } = await pool.query(query, [
//     customerId,
//     age,
//     income,
//     home_ownership,
//     employment_length_years,
//     default_on_file,
//     credit_history_length_years,
//   ]);
//   return rows[0].profile_id;
// }

/**
 * Tìm thông tin khách hàng và hồ sơ mới nhất của họ.
 * Nếu loanAmount được cung cấp, hàm sẽ cập nhật loan_amount cho hồ sơ đó.
 * Tất cả các thao tác được thực hiện trong một giao dịch để đảm bảo toàn vẹn dữ liệu.
 * @param {string} keycloakId - ID người dùng từ Keycloak.
 * @param {number} [loanAmount] - (Tùy chọn) Số tiền vay mới để cập nhật.
 * @returns {Promise<object|null>} Trả về object chứa thông tin khách hàng và hồ sơ, hoặc null nếu không tìm thấy.
 */
async function findAndOptionalUpdateProfile(keycloakId, loanAmount) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const selectQuery = `
            SELECT
                c.customer_id, c.full_name, c.email,
                p.profile_id, p.age, p.income, p.home_ownership,
                p.employment_length_years, p.default_on_file,
                p.credit_history_length_years, p.loan_amount, p.loan_intent,
                p.loan_grade, p.interest_rate, p.loan_term, p.percent_income,
                p.created_at AS profile_created_at
            FROM customers c
            LEFT JOIN application_profiles p ON c.customer_id = p.customer_id
            WHERE c.keycloak_user_id = $1
            ORDER BY p.created_at DESC
            LIMIT 1;
        `;

    const { rows } = await client.query(selectQuery, [keycloakId]);
    const customerProfile = rows[0];

    if (!customerProfile) {
      await client.query("COMMIT");
      return null;
    }

    if (loanAmount && customerProfile.profile_id) {
      const updateQuery = `
                UPDATE application_profiles
                SET 
                    loan_amount = $1,
                    percent_income = ($1::numeric / income) 
                WHERE 
                    profile_id = $2
                RETURNING *;
            `;

      const updatedResult = await client.query(updateQuery, [
        loanAmount,
        customerProfile.profile_id,
      ]);
      const updatedProfileData = updatedResult.rows[0];

      const finalResult = {
        ...customerProfile,
        ...updatedProfileData,
      };

      await client.query("COMMIT");
      return finalResult;
    } else {
      await client.query("COMMIT");
      return customerProfile;
    }
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Lỗi trong quá trình giao dịch:", error);
    throw error;
  } finally {
    client.release();
  }
}

async function createApplicationProfile(keycloakId, profileData) {
  const {
    age,
    income,
    home_ownership,
    employment_length_years,
    default_on_file,
    credit_history_length_years,
  } = profileData;
  const query = `
      INSERT INTO application_profiles (
        customer_id, age, income, home_ownership, 
        employment_length_years, default_on_file, credit_history_length_years
      ) 
      VALUES 
        (
          (SELECT customer_id FROM customers WHERE keycloak_user_id = $1), 
          $2, $3, $4, $5, $6, $7
        ) 
      RETURNING profile_id;
    `;

  const values = [
    keycloakId,
    age,
    income,
    home_ownership,
    employment_length_years,
    default_on_file,
    credit_history_length_years,
  ];

  try {
    const { rows } = await pool.query(query, values);

    if (rows.length === 0) {
      throw new Error(
        `Không tìm thấy khách hàng với keycloakId: ${keycloakId}`
      );
    }

    return rows[0].profile_id;
  } catch (error) {
    console.error("Lỗi khi tạo application profile:", error);
    throw error;
  }
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
 * Tìm profile_id trong bảng application_profiles dựa vào keycloakId của người dùng.
 * @param {() => string} keycloakId - ID người dùng từ Keycloak.
 * @returns {Promise<number|null>} Trả về profile_id nếu tìm thấy, ngược lại trả về null.
 */
async function findProfileIdByKeycloakId(keycloakId) {
  const query = `
        SELECT ap.profile_id
        FROM application_profiles AS ap
        JOIN customers AS c ON ap.customer_id = c.customer_id
        WHERE c.keycloak_user_id = $1
        ORDER BY ap.created_at DESC
        LIMIT 1;
    `;

  try {
    const { rows } = await pool.query(query, [keycloakId]);
    console.log("rows", rows);
    return rows.length > 0 ? rows?.[0]?.profile_id : null;
  } catch (error) {
    console.error("Error finding profile by Keycloak ID:", error);
    throw error;
  }
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

async function updateApplicationWithProcessId(
  applicationId,
  processInstanceId
) {
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
  findProfileIdByKeycloakId,
  createLoanApplication,
  updateApplicationWithProcessId,
  findAndOptionalUpdateProfile,
  findActiveApplicationByCustomerId,
};
