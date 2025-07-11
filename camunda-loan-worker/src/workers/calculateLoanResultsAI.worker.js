client.subscribe("calculateLoanResultsAI", async ({ task, taskService }) => {
    console.log(`🤖 Nhận được tác vụ [calculateLoanResultsAI]...`);

    const customerData = task.variables.get("customerData");

    if (!customerData) {
        console.error("Lỗi: Không tìm thấy 'customerData' để gửi cho AI.");
        return await taskService.handleFailure(task, {
            errorMessage: "Thiếu customerData để ra quyết định."
        });
    }

    try {
        const aiServiceUrl = 'http://your-ai-service.com/decide-loan';

        console.log(`...gửi yêu cầu đến service AI: ${aiServiceUrl}`);
        console.log(`...với dữ liệu:`, customerData);

        const response = await axios.post(aiServiceUrl, customerData);

        const loanResults = response.data;

        if (!loanResults || !loanResults.decision) {
            console.error("Lỗi: Dữ liệu trả về từ AI không đúng định dạng.");
            return await taskService.handleFailure(task, {
                errorMessage: "Dữ liệu trả về từ AI không chứa key 'decision'."
            });
        }

        console.log("✅ AI đã trả về kết quả:", loanResults);

        const processVariables = new Map();
        processVariables.set("loan_results", loanResults);

        await taskService.complete(task, processVariables);

    } catch (error) {
        console.error("❌ Lỗi khi gọi service AI:", error.message);
        await taskService.handleFailure(task, {
            errorMessage: "Không thể kết nối hoặc có lỗi từ service AI.",
            errorDetails: error.stack
        });
    }
});



