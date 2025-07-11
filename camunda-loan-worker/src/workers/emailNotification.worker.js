const { SendEmailCommand } = require("@aws-sdk/client-ses");
const config = require('../config');

function registerEmailNotificationWorker(client, sesClient) {
    client.subscribe("emailNotification", async ({ task, taskService }) => {
        const type = task.variables.get("type");
        console.log(`✉️ Nhận được tác vụ [emailNotification] loại: ${type}`);

        try {
            const customerData = task.variables.get("customerData") || {};
            let toAddress = customerData.email || 'default-customer@example.com';
            const fromAddress = config.aws.ses.fromAddress;

            let subject = "";
            let body = "";

            switch (type) {
                case "offer":
                    const product = task.variables.get("recommendedProduct") || {};
                    subject = "Chúc mừng! Đề nghị vay vốn của bạn đã được phê duyệt";
                    body = `Chào ${customerData.name || 'quý khách'},\n\nSản phẩm được đề xuất cho bạn là: ${product.name} với lãi suất ${product.interest_rate}.`;
                    break;

                case "rejection":
                    subject = "Thông báo về đơn yêu cầu vay vốn của bạn";
                    body = `Chào ${customerData.name || 'quý khách'},\n\nChúng tôi rất tiếc phải thông báo rằng đơn yêu cầu vay vốn của bạn chưa được phê duyệt lúc này.`;
                    break;

                case "confirmation":
                    subject = "Xác nhận khoản vay thành công";
                    body = `Chào ${customerData.name || 'quý khách'},\n\nKhoản vay của bạn đã được giải ngân thành công.`;
                    break;

                case "reminder":
                    subject = "Nhắc nhở: Vui lòng phản hồi đề nghị vay vốn";
                    body = `Chào ${customerData.name || 'quý khách'},\n\nChúng tôi thấy bạn chưa phản hồi về đề nghị vay vốn đã gửi trước đó.`;
                    break;

                case "managerInsights":
                    const insights = task.variables.get("insights") || "Không có phân tích chi tiết.";
                    toAddress = config.managerEmail; // Lấy email quản lý từ config
                    subject = `[Cần xem xét] Đơn vay của khách hàng ${customerData.name || 'chưa rõ'}`;
                    body = `Một đơn vay cần được xem xét thủ công.\n\nPhân tích từ LLM:\n"${insights}"`;
                    break;

                default:
                    console.warn(`Loại email không xác định: ${type}`);
                    return taskService.complete(task);
            }

            const command = new SendEmailCommand({
                Source: fromAddress,
                Destination: { ToAddresses: [toAddress] },
                Message: {
                    Subject: { Data: subject },
                    Body: { Text: { Data: body } },
                },
            });

            await sesClient.send(command);
            console.log(`✅ Gửi email loại '${type}' đến ${toAddress} thành công.`);
            await taskService.complete(task);

        } catch (error) {
            console.error(`❌ Lỗi khi gửi email loại '${type}':`, error);
            await taskService.handleFailure(task, { errorMessage: error.message });
        }
    });
}

module.exports = registerEmailNotificationWorker;