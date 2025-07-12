const { Client } = require("camunda-external-task-client-js");
const { Pool } = require('pg');
const { createClient } = require('redis');
const { SESClient } = require("@aws-sdk/client-ses");

const config = require("./src/config");

const registerGetCustomerDataWorker = require("./src/workers/getCustomerData.worker");
const registerValidateDataWorker = require("./src/workers/validateData.worker");
const registerCalculateLoanResultsAIWorker = require("./src/workers/calculateLoanResultsAI.worker");
const registerRecommendProductWorker = require("./src/workers/recommendProductAI.worker");
const registerAnalyzeLLMWorker = require("./src/workers/analyzeWithLLM.worker");
const registerProvideLoanWorker = require("./src/workers/provideLoan.worker");
const registerEmailNotificationWorker = require("./src/workers/emailNotification.worker");


async function main() {
    console.log("🚀 Worker đang khởi động...");

    const pool = new Pool(config.db);
    const redisClient = createClient(config.redis);
    // const sesClient = new SESClient(config.aws.ses); // Giả sử config.aws.ses đã có



    redisClient.on('error', (err) => console.log('Redis Client Error', err));

    try {
        await redisClient.connect();
        console.log('✅ Đã kết nối đến Redis.');
    } catch (error) {
        console.error('❌ Không thể kết nối đến Redis:', error);
        process.exit(1);
    }

    const client = new Client(config.camunda);
    console.log(`...kết nối đến Camunda tại ${config.camunda.baseUrl}`);

    registerGetCustomerDataWorker(client, pool, redisClient);
    registerValidateDataWorker(client);
    registerCalculateLoanResultsAIWorker(client, redisClient); // AI worker cũng có thể dùng cache
    registerRecommendProductWorker(client, redisClient);   // Worker này cũng có thể dùng cache
    registerAnalyzeLLMWorker(client, redisClient);         // Worker này cũng có thể dùng cache
    registerProvideLoanWorker(client);
    registerEmailNotificationWorker(client);

    console.log("👍 Worker đã đăng ký tất cả topics và sẵn sàng xử lý tác vụ.");
}


main().catch(err => {
    console.error("Lỗi nghiêm trọng khi khởi động worker:", err);
    process.exit(1);
});