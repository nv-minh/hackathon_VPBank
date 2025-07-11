
const { SESClient, SendEmailCommand } = require("@aws-sdk/client-ses");


const sesConfig = {
    region: "us-east-1",
    credentials: {
        accessKeyId: "YOUR_AWS_ACCESS_KEY_ID",
        secretAccessKey: "YOUR_AWS_SECRET_ACCESS_KEY",
    },
};


const sesClient = new SESClient(sesConfig);


client.subscribe("emailNotification", async ({ task, taskService }) => {
    console.log(`✉️ Nhận được tác vụ [emailNotification]...`);

    const type = task.variables.get("type");
    const customerData = task.variables.get("customerData");
    const toAddress = customerData?.email || "default.recipient@example.com";
    const fromAddress = "noreply@yourbank.com"; // Email đã được xác thực trên AWS SES

    let subject = "";
    let body = "";

    try {
        switch (type) {
            case "offer":
                const product = task.variables.get("recommendedProduct");
                subject = "Chúc mừng! Đề nghị vay vốn của bạn đã được phê duyệt";
                body = `Chào ${customerData.name},\n\nChúng tôi vui mừng thông báo rằng bạn đã được phê duyệt cho sản phẩm: ${product.name} với lãi suất ${product.interest_rate}.\nVui lòng phản hồi để xác nhận.`;
                break;

            case "rejection":
                subject = "Thông báo về đơn yêu cầu vay vốn của bạn";
                body = `Chào ${customerData.name},\n\nSau khi xem xét, chúng tôi rất tiếc phải thông báo rằng đơn yêu cầu vay vốn của bạn chưa được phê duyệt lúc này. Cảm ơn bạn đã quan tâm.`;
                break;

            case "confirmation":
                subject = "Xác nhận khoản vay thành công";
                body = `Chào ${customerData.name},\n\nKhoản vay của bạn đã được giải ngân thành công. Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi.`;
                break;

            case "reminder":
                subject = "Nhắc nhở: Vui lòng phản hồi đề nghị vay vốn";
                body = `Chào ${customerData.name},\n\nChúng tôi thấy bạn chưa phản hồi về đề nghị vay vốn đã gửi trước đó. Đề nghị sẽ hết hạn trong vài ngày tới.`;
                break;

            case "managerInsights":
                const insights = task.variables.get("insights");
                subject = `[Cần xem xét] Đơn vay của khách hàng ${customerData.name}`;
                body = `Một đơn vay cần được xem xét thủ công.\n\nPhân tích từ LLM:\n"${insights}"`;
                // toAddress = "manager@yourbank.com";
                break;

            default:
                console.warn(`Loại email không xác định: ${type}`);
                return await taskService.complete(task);
        }

        const emailParams = {
            Source: fromAddress,
            Destination: { ToAddresses: [toAddress] },
            Message: {
                Subject: { Data: subject },
                Body: { Text: { Data: body } },
            },
        };

        console.log(`...đang gửi email loại '${type}' đến ${toAddress}`);
        await sesClient.send(new SendEmailCommand(emailParams));
        console.log("✅ Gửi email thành công qua AWS SES.");

        await taskService.complete(task);

    } catch (error) {
        console.error(`❌ Lỗi khi xử lý email loại '${type}':`, error);
        await taskService.handleFailure(task, { errorMessage: error.message });
    }
});