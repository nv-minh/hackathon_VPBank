const axios = require('axios');
const { Variables } = require("camunda-external-task-client-js");

function registerCalculateLoanResultsAIWorker(client, redisClient) {

    client.subscribe("calculateLoanResultsAI", async ({ task, taskService }) => {
        console.log(`🤖 Nhận được tác vụ [calculateLoanResultsAI]...`);

        try {
            const customerData = task.variables.get("customerData");
            if (!customerData) {
                throw new Error("Không tìm thấy 'customerData' để gửi cho AI.");
            }

            const cacheKey = `loan_results:${customerData.application_id}`;
            console.log(`...kiểm tra cache với key: ${cacheKey}`);

            const cachedResults = await redisClient.get(cacheKey);

            if (cachedResults) {
                console.log("✅ Cache HIT. Sử dụng kết quả từ Redis.");
                const loanResults = JSON.parse(cachedResults);

                const processVariables = new Variables();
                processVariables.set("loan_results", loanResults);
                return await taskService.complete(task, processVariables);
            }

            // 3. Cache MISS: Gọi API thật nếu không có cache
            console.log("... Cache MISS. Gọi đến service AI thật.");
            const aiServiceUrl = 'http://your-ai-service.com/decide-loan';
            const response = await axios.post(aiServiceUrl, customerData);
            const loanResults = response.data;

            if (!loanResults || !loanResults.decision) {
                throw new Error("Dữ liệu trả về từ AI không đúng định dạng.");
            }

            await redisClient.set(cacheKey, JSON.stringify(loanResults), {
                EX: 3600 // Hết hạn sau 3600 giây
            });
            console.log(`...đã lưu kết quả vào cache.`);

            console.log("✅ AI đã trả về kết quả:", loanResults);
            const processVariables = new Variables();
            processVariables.set("loan_results", loanResults);
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