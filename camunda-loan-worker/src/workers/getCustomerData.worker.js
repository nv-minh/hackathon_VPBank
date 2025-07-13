const { Variables } = require("camunda-external-task-client-js");

/**
 * @param {object} client - Camunda External Task Client
 * @param {object} pool - Pool kết nối PostgreSQL đã được khởi tạo
 * @param {object} redisClient - Client Redis đã được khởi tạo và kết nối
 */
function registerGetCustomerDataWorker(client, pool, redisClient) {
    client.subscribe("getCustomerData", async ({ task, taskService }) => {
        console.log(`⚡️ Nhận được tác vụ [getCustomerData]...`);
        const applicationId = task.variables.get("applicationId");

        if (!applicationId) {
            return await taskService.handleFailure(task, { errorMessage: "Thiếu applicationId." });
        }

        const cacheKey = `customer_data:${applicationId}`;

        try {
            const cachedData = await redisClient.get(cacheKey);
            if (cachedData) {
                console.log("CACHE HIT! Lấy dữ liệu từ Redis.");
                const customerData = JSON.parse(cachedData);

                const processVariables = new Variables();
                processVariables.set("customerData", customerData);
                await taskService.complete(task, processVariables);
                return;
            }

            console.log("CACHE MISS! Truy vấn từ PostgreSQL.");

            const query = `
                SELECT
                    c.customer_id, c.full_name, c.email, c.keycloak_user_id,
                    
                    p.profile_id, p.age, p.income, p.home_ownership, p.employment_length_years,
                    p.default_on_file, p.credit_history_length_years,
                    p.loan_amount, p.loan_intent, p.loan_grade, p.interest_rate, p.loan_term, p.percent_income,
                    
                    la.application_id, la.status,
                    la.created_at AS application_created_at
                FROM
                    loan_applications la
                JOIN
                    customers c ON la.customer_id = c.customer_id
                JOIN
                    application_profiles p ON la.profile_id = p.profile_id
                WHERE
                    la.application_id = $1;
            `;
            const { rows } = await pool.query(query, [applicationId]);
            if (rows.length === 0) {
                return await taskService.handleBpmnError(task, "DATA_NOT_FOUND", `Không tìm thấy dữ liệu cho đơn vay id = ${applicationId}`);
            }

            const dbData = rows[0];

            const customerData = {
                customer_id: Number(dbData.customer_id),
                full_name: String(dbData.full_name || ''),
                email: String(dbData.email || ''),
                keycloak_user_id: String(dbData.keycloak_user_id),

                // Profile Info
                profile_id: Number(dbData.profile_id),
                age: dbData.age ? Number(dbData.age) : null,
                income: dbData.income ? Number(dbData.income) : null,
                home_ownership: String(dbData.home_ownership || ''),
                employment_length_years: dbData.employment_length_years ? Number(dbData.employment_length_years) : null,
                default_on_file: String(dbData.default_on_file || ''),
                credit_history_length_years: dbData.credit_history_length_years ? Number(dbData.credit_history_length_years) : null,

                // Loan Info from Profile
                loan_amount: dbData.loan_amount ? parseFloat(dbData.loan_amount) : null,
                loan_intent: String(dbData.loan_intent || ''),
                loan_grade: String(dbData.loan_grade || ''),
                interest_rate: dbData.interest_rate ? parseFloat(dbData.interest_rate) : null,
                loan_term: dbData.loan_term ? parseFloat(dbData.loan_term) : null,
                percent_income: dbData.percent_income ? parseFloat(dbData.percent_income) : null,

                // Application Info
                application_id: Number(dbData.application_id),
                status: String(dbData.status || ''),
                application_created_at: dbData.application_created_at ? dbData.application_created_at.toISOString() : null
            };

            await redisClient.set(cacheKey, JSON.stringify(customerData), { EX: 3600 });
            console.log("Đã lưu kết quả đã làm sạch vào Redis.");

            const processVariables = new Variables();
            processVariables.set("customerData", customerData);
            await taskService.complete(task, processVariables);

        } catch (error) {
            console.error(`Lỗi khi xử lý getCustomerData: ${error.message}`);
            await taskService.handleFailure(task, { errorMessage: error.message, errorDetails: error.stack });
        }
    });
}

module.exports = registerGetCustomerDataWorker;