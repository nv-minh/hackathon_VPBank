const axios = require('axios');
const { Variables } = require("camunda-external-task-client-js");

function registerAnalyzeLLMWorker(client, redisClient) {
    client.subscribe("analyzeWithLLM", async ({ task, taskService }) => {
        console.log("🧠 Nhận được tác vụ [analyzeWithLLM]...");

        try {
            const customerData = task.variables.get("customerData");
            if (!customerData) {
                throw new Error("Không tìm thấy 'customerData' để gửi cho LLM.");
            }

            const cacheKey = `llm_analysis:${customerData.application_id}`;
            console.log(`...kiểm tra cache với key: ${cacheKey}`);

            const cachedAnalysis = await redisClient.get(cacheKey);

            if (cachedAnalysis) {
                console.log("✅ Cache HIT. Sử dụng kết quả phân tích từ Redis.");
                const insights = JSON.parse(cachedAnalysis);

                const processVariables = new Variables();
                processVariables.set("insights", insights);
                return await taskService.complete(task, processVariables);
            }

            console.log("... Cache MISS. Gọi đến service LLM.");
            // const bedrockServiceUrl = 'https://your-aws-bedrock-service.com/analyze-reason';
            // const response = await axios.post(bedrockServiceUrl, customerData);
            // const analysisResult = response.data;
            // const insights = analysisResult.analysis_text;
            const insights = "cũng được đấy hãy cân nhắc";

            if (!insights) {
                throw new Error("Dữ liệu từ LLM không có nội dung phân tích.");
            }

            await redisClient.set(cacheKey, JSON.stringify(insights), { EX: 3600 });
            console.log(`...đã lưu phân tích vào cache.`);

            console.log("✅ LLM đã trả về phân tích thành công.");
            const processVariables = new Variables();
            processVariables.set("insights", insights);
            await taskService.complete(task, processVariables);

        } catch (error) {
            console.error("❌ Lỗi trong worker [analyzeWithLLM]:", error.message);
            await taskService.handleFailure(task, {
                errorMessage: error.message,
                errorDetails: error.stack
            });
        }
    });
}

module.exports = registerAnalyzeLLMWorker;