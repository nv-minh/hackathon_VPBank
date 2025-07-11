const { Client } = require("camunda-external-task-client-js");
const camundaConfig = require("./src/config/camunda.config");
const { SESClient } = require("@aws-sdk/client-ses");

const registerGetCustomerDataWorker = require("./src/workers/getCustomerData.worker");
const registerCalculateLoanResultsAIWorker = require("./src/workers/calculateLoanResultsAI.worker"); // Dòng mới
const registerValidateDataWorker = require("./src/workers/validateData.worker"); // Dòng mới

const sesClient = new SESClient(config.aws.ses);
const client = new Client(camundaConfig);

console.log("🚀 Worker đang khởi động...");
console.log(`...kết nối đến Camunda tại ${camundaConfig.baseUrl}`);

registerGetCustomerDataWorker(client);
registerValidateDataWorker(client);
registerCalculateLoanResultsAIWorker(client);

console.log("👍 Worker đã đăng ký các topics và sẵn sàng xử lý tác vụ.");