const axios = require('axios');
const { Variables } = require("camunda-external-task-client-js");

function registerRecommendProductWorker(client, redisClient) {
    client.subscribe("recommendProduct", async ({ task, taskService }) => {
        console.log(`💡 Nhận được tác vụ [recommendProduct]...`);

        try {
            const customerData = task.variables.get("customerData");
            if (!customerData) {
                throw new Error("Không tìm thấy 'customerData' để gợi ý sản phẩm.");
            }

            const cacheKey = `recommendation:${customerData.application_id}`;
            console.log(`...kiểm tra cache với key: ${cacheKey}`);

            const cachedRecommendation = await redisClient.get(cacheKey);

            if (cachedRecommendation) {
                console.log("✅ Cache HIT. Sử dụng gợi ý sản phẩm từ Redis.");
                const recommendedProduct = JSON.parse(cachedRecommendation);

                const processVariables = new Variables();
                processVariables.set("recommendedProduct", recommendedProduct);
                return await taskService.complete(task, processVariables);
            }

            console.log("... Cache MISS. Gọi đến service gợi ý sản phẩm.");
            const recommendServiceUrl = 'http://your-ai-service.com/recommend-product';
            const response = await axios.post(recommendServiceUrl, customerData);
            const recommendedProduct = response.data;

            await redisClient.set(cacheKey, JSON.stringify(recommendedProduct), { EX: 3600 });
            console.log(`...đã lưu gợi ý vào cache.`);

            console.log("✅ AI đã gợi ý sản phẩm:", recommendedProduct);
            const processVariables = new Variables();
            processVariables.set("recommendedProduct", recommendedProduct);
            await taskService.complete(task, processVariables);

        } catch (error) {
            console.error("❌ Lỗi trong worker [recommendProduct]:", error.message);
            await taskService.handleFailure(task, {
                errorMessage: error.message,
                errorDetails: error.stack
            });
        }
    });
}

module.exports = registerRecommendProductWorker;