client.subscribe("analyzeWithLLM", async ({ task, taskService }) => {
    console.log("🧠 Nhận được tác vụ [analyzeWithLLM] để gọi Bedrock...");

    const customerData = task.variables.get("customerData");

    if (!customerData) {
        console.error("Lỗi: Không tìm thấy 'customerData' để gửi cho LLM.");
        return await taskService.handleFailure(task, {
            errorMessage: "Thiếu customerData để phân tích."
        });
    }

    try {
        const bedrockServiceUrl = 'https://your-aws-bedrock-service.com/analyze-reason';

        console.log(`...gửi yêu cầu đến service LLM: ${bedrockServiceUrl}`);

        const response = await axios.post(bedrockServiceUrl, customerData);

        const analysisResult = response.data;
        const insights = analysisResult.analysis_text;

        if (!insights) {
            console.error("Lỗi: Dữ liệu từ LLM không có nội dung phân tích.");
            return await taskService.handleFailure(task, {
                errorMessage: "Kết quả từ LLM không đúng định dạng."
            });
        }

        console.log("✅ LLM đã trả về phân tích thành công.");

        const processVariables = new Map();
        processVariables.set("insights", insights);

        await taskService.complete(task, processVariables);

    } catch (error) {
        console.error("❌ Lỗi khi gọi service LLM:", error.message);
        await taskService.handleFailure(task, {
            errorMessage: "Không thể kết nối hoặc có lỗi từ service LLM.",
            errorDetails: error.stack
        });
    }
});