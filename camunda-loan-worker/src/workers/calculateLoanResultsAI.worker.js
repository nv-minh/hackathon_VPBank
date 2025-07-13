const axios = require('axios');
const { Variables } = require("camunda-external-task-client-js");

/**
 * Đăng ký worker để gọi service AI ra quyết định khoản vay.
 * Worker này sẽ:
 * 1. Lấy dữ liệu khách hàng.
 * 2. Kiểm tra cache Redis trước.
 * 3. Nếu không có cache, tạo payload và gọi API AI.
 * 4. Xử lý điểm số trả về, chuyển thành quyết định (approve/review/decline).
 * 5. Lưu kết quả vào cache và trả về cho Camunda.
 * @param {object} client - Camunda External Task Client
 * @param {object} redisClient - Client Redis đã được khởi tạo và kết nối
 */
function registerCalculateLoanResultsAIWorker(client, redisClient) {
    client.subscribe("calculateLoanResultsAI", async ({ task, taskService }) => {
        console.log(`🤖 Nhận được tác vụ [calculateLoanResultsAI]...`);

        try {
            const customerData = task.variables.get("customerData");
            if (!customerData || !customerData.application_id) {
                throw new Error("Không tìm thấy 'customerData' hoặc 'application_id' để gửi cho AI.");
            }

            const cacheKey = `loan_results:${customerData.application_id}`;
            const cachedResults = await redisClient.get(cacheKey);

            if (cachedResults) {
                console.log("✅ Cache HIT. Sử dụng kết quả từ Redis.");
                const loanResults = JSON.parse(cachedResults);

                const processVariables = new Variables();
                processVariables.set("loan_results", loanResults);
                return await taskService.complete(task, processVariables);
            }

            console.log("... Cache MISS. Gọi đến service AI thật.");
            const apiPayload = {
                input: {
                    person_age: customerData.age,
                    person_income: customerData.income,
                    person_home_ownership: customerData.home_ownership,
                    person_emp_length: customerData.employment_length_years,
                    loan_intent: customerData.loan_intent,
                    loan_grade: customerData.loan_grade,
                    loan_amnt: customerData.loan_amount,
                    loan_int_rate: customerData.interest_rate,
                    loan_percent_income: customerData.percent_income,
                    cb_person_default_on_file: customerData.default_on_file,
                    cb_person_cred_hist_length: customerData.credit_history_length_years
                }
            };

            console.log("... Chuẩn bị gọi service AI với payload:", JSON.stringify(apiPayload, null, 2));
            const aiServiceUrl = `${process.env.AWS_URL_SERVICE_AI}/loan-prediction/loan-pred-resources`;
            const response = await axios.post(aiServiceUrl, apiPayload);
            console.log("response",response.data)
            const aiResponse = response.data;

            if (!aiResponse || typeof aiResponse.score === 'undefined') {
                throw new Error("Dữ liệu trả về từ AI không đúng định dạng hoặc không chứa 'score'.");
            }

            const score = aiResponse.score;
            let decision = 'decline';

            if (score >= 0.8) {
                decision = 'approve';
            } else if (score >= 0.5) {
                decision = 'review';
            }


            console.log(`✅ AI trả về score: ${score}. Chuyển đổi thành decision: '${decision}'.`);

            // 4. Lưu kết quả vào cache và hoàn thành tác vụ
            await redisClient.set(cacheKey, JSON.stringify(decision), {
                EX: 3600 // Hết hạn sau 1 giờ
            });
            console.log(`...đã lưu kết quả vào cache.`);

            const processVariables = new Variables();
            processVariables.set("loan_decision", decision);
            processVariables.set("loan_score", score);
            processVariables.set("customerData", customerData);

            await taskService.complete(task, processVariables);

        } catch (error) {
            console.error("❌ Lỗi trong worker [calculateLoanResultsAI]:", error.message);
            await taskService.handleFailure(task, {
                errorMessage: error.message,
                errorDetails: error.stack
            });
        }
    });
}

module.exports = registerCalculateLoanResultsAIWorker;