const axios = require("axios");
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

      const llmServiceUrl = "http://44.221.19.64:8000/llm-reasoning";

      const apiPayload = {
        input: {
          person_age: 25.0,
          person_income: 45000.0,
          person_home_ownership: "OWN",
          person_emp_length: 1.0,
          loan_intent: "PERSONAL",
          loan_grade: "C",
          loan_amnt: 10000.0,
          loan_int_rate: 12.87,
          loan_percent_income: 0.22,
          cb_person_default_on_file: "Y",
          cb_person_cred_hist_length: 2.0,
        },
      };
      console.log("apiPayload", apiPayload);

      const response = await axios.post(llmServiceUrl, apiPayload, {
        headers: { "Content-Type": "application/json" },
      });

      const insights = response?.data?.answer || response.data;

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
      let errorMessage = "Lỗi không xác định";
      if (axios.isAxiosError(error)) {
        errorMessage = `Lỗi khi gọi service LLM: ${
          error.response
        } - ${JSON.stringify(error.response?.data)}`;
        console.error(`❌ ${errorMessage}`);
      } else {
        errorMessage = error.message;
        console.error("❌ Lỗi trong worker [analyzeWithLLM]:", errorMessage);
      }

      await taskService.handleFailure(task, {
        errorMessage: errorMessage,
        errorDetails: error.stack,
      });
    }
  });
}

module.exports = registerAnalyzeLLMWorker;
