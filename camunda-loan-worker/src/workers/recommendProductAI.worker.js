client.subscribe("recommendProduct", async ({ task, taskService }) => {
    console.log(`💡 Nhận được tác vụ [recommendProduct] để gọi AI...`);

    const customerData = task.variables.get("customerData");

    if (!customerData) {
        console.error("Lỗi: Không tìm thấy 'customerData' để gửi cho AI gợi ý sản phẩm.");
        return await taskService.handleFailure(task, {
            errorMessage: "Thiếu customerData để gợi ý sản phẩm."
        });
    }

    try {
        const recommendServiceUrl = 'http://your-ai-service.com/recommend-product';

        console.log(`...gửi yêu cầu đến service gợi ý sản phẩm: ${recommendServiceUrl}`);

        const response = await axios.post(recommendServiceUrl, customerData);
        const recommendedProduct = response.data;

        console.log("✅ AI đã gợi ý sản phẩm:", recommendedProduct);

        const processVariables = new Map();
        processVariables.set("recommendedProduct", recommendedProduct);

        await taskService.complete(task, processVariables);

    } catch (error) {
        console.error("❌ Lỗi khi gọi service AI gợi ý sản phẩm:", error.message);
        await taskService.handleFailure(task, {
            errorMessage: "Không thể kết nối hoặc có lỗi từ service AI gợi ý sản phẩm.",
            errorDetails: error.stack
        });
    }
});