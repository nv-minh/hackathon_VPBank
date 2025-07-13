
const { sendEmail } = require('../services/email.service');
const { Variables } = require("camunda-external-task-client-js");
const {updateApplicationStatus} = require("../services/postgres.service");

function registerEmailNotificationWorker(client, sesClient) {
    client.subscribe("emailNotification", async ({ task, taskService }) => {
        const type = task.variables.get("type");
        console.log(`📧 Nhận được tác vụ [emailNotification] loại: "${type}"`);
        let newStatus = null;

        try {
            const customerData = task.variables.get("customerData") || {};
            let recipientEmail = customerData.email || 'default-customer@example.com';
            const fromAddress = process.env.AWS_SES_FROM_ADDRESS;

            let subject = '';
            let body = '';

            switch (type) {
                case 'offer':
                    const product = task.variables.get("recommendedProduct") || {};
                    subject = 'Chúc mừng! Đề nghị vay vốn của bạn đã được phê duyệt';
                    body = `
                        <p>Chào ${customerData.full_name || 'quý khách'},</p>
                        <p>Chúng tôi vui mừng thông báo bạn đã được phê duyệt với số tiền ${customerData.loan_amount}</strong>.</p>
                        <p>Để xác nhận và tiếp tục, vui lòng nhấp vào nút bên dưới:</p>
                        <a href="http://localhost:3000/accept-offer?applicationId=${customerData.application_id}" 
                           style="background-color: #4CAF50; color: white; padding: 15px 25px; text-align: center; text-decoration: none; display: inline-block; font-size: 16px;">
                           Đồng ý với Đề nghị
                        </a>`;
                    break;

                case 'rejection':
                    newStatus = 'REJECTED';
                    subject = 'Thông báo về đơn vay của bạn';
                    body = `<p>Chào ${customerData.full_name || 'quý khách'},</p><p>Sau khi xem xét, chúng tôi rất tiếc phải thông báo rằng đơn vay của bạn chưa được phê duyệt lần này.</p>`;
                    break;

                case 'confirmation':
                    newStatus = 'COMPLETED';
                    subject = 'Xác nhận khoản vay thành công';
                    body = `<p>Chào ${customerData.full_name || 'quý khách'},</p><p>Khoản vay của bạn đã được giải ngân thành công. Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi.</p>`;
                    break;

                case 'reminder':
                    subject = 'Nhắc nhở: Vui lòng phản hồi đề nghị vay vốn';
                    body = `<p>Chào ${customerData.full_name || 'quý khách'},</p><p>Chúng tôi thấy bạn chưa phản hồi về đề nghị vay vốn đã gửi trước đó. Đề nghị sẽ sớm hết hạn.</p>`;
                    break;

                case 'managerInsights':
                    const insights = task.variables.get("insights") || "Không có phân tích chi tiết.";
                    recipientEmail = process.env.MANAGER_EMAIL;
                    subject = `[Cần xem xét] Đơn vay của khách hàng ${customerData.full_name || 'chưa rõ'}`;
                    body = `<p>Một đơn vay cần được xem xét thủ công.</p><p><strong>Phân tích từ LLM:</strong></p><p>"${insights}"</p>`;
                    break;

                default:
                    console.warn(`Loại email không xác định: "${type}". Tác vụ sẽ được hoàn thành mà không gửi email.`);
                    return taskService.complete(task);
            }

            await sendEmail(recipientEmail, subject, body);
            if (newStatus && customerData.application_id) {
                await updateApplicationStatus(customerData.application_id, newStatus);
            }
            console.log(`👍 Hoàn thành tác vụ gửi email loại "${type}" đến ${recipientEmail}.`);
            await taskService.complete(task);

        } catch (error) {
            console.error(`❌ Lỗi trong worker gửi email:`, error.message);
            await taskService.handleFailure(task, {
                errorMessage: "Không thể gửi email thông báo.",
                errorDetails: error.stack,
            });
        }
    });
}

module.exports = registerEmailNotificationWorker;