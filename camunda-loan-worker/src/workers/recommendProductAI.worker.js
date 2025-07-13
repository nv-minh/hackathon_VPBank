const axios = require('axios');
const { Variables } = require("camunda-external-task-client-js");
const {saveRecommendation} = require("../services/postgres.service");

function registerRecommendProductWorker(client, redisClient) {
    client.subscribe("recommendProduct", async ({ task, taskService }) => {
        console.log(`💡 Nhận được tác vụ [recommendProduct]...`);

        try {
            const customerData = task.variables.get("customerData");
            if (!customerData) {
                throw new Error("Không tìm thấy 'customerData' để gợi ý sản phẩm.");
            }

            const apiPayload = {
                input: {
                    id:customerData.customer_id,
                    person_age: customerData.age,
                    person_income: customerData.income,
                    person_home_ownership: customerData.home_ownership,
                    loan_amnt: customerData.loan_amount,
                }
            };
            console.log("... Cache MISS. Gọi đến service gợi ý sản phẩm.");
            const recommendServiceUrl = `${process.env.AWS_URL_SERVICE_RCM}/prod/recommend-product`;
            const response = await axios.post(recommendServiceUrl, apiPayload);
            const parsedBody = JSON.parse(response.data.body);
            const recommendedProduct = parsedBody.prediction.result;

            if (recommendedProduct && recommendedProduct.product_id) {
                await saveRecommendation(customerData.application_id, recommendedProduct);
            }

            console.log("✅ AI đã gợi ý sản phẩm:", recommendedProduct);
            const processVariables = new Variables();
            processVariables.set("recommendedProduct", recommendedProduct);
            processVariables.set("customerData", customerData);
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