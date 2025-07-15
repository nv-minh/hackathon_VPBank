const { sendEmail } = require('../services/email.service');
const { Variables } = require("camunda-external-task-client-js");
const { updateApplicationStatus } = require("../services/postgres.service");

function formatCurrencyVND(value) {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        maximumFractionDigits: 0
    }).format(value);
}

function registerEmailNotificationWorker(client, sesClient) {
    client.subscribe("emailNotification", async ({ task, taskService }) => {
        const type = task.variables.get("type");
        const insights = task.variables.get("insights");
        console.log(`📧 Nhận được tác vụ [emailNotification] loại: "${type}"`);

        let newStatus = null;

        try {
            const customerData = task.variables.get("customerData") || {};
            let recipientEmail = customerData.email || 'default-customer@example.com';
            const fromAddress = process.env.AWS_SES_FROM_ADDRESS;

            let subject = '';
            let bodyContent = '';

            const emailTemplate = (content) => `
        <html>
          <head>
            <style>
              body {
                background-color: #f4f4f4;
                font-family: Arial, sans-serif;
                margin: 0;
                padding: 0;
              }
              .container {
                background-color: #ffffff;
                margin: 30px auto;
                padding: 30px;
                border-radius: 8px;
                max-width: 600px;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
              }
              .button {
                background-color: #4CAF50;
                color: white;
                padding: 14px 24px;
                text-align: center;
                text-decoration: none;
                display: inline-block;
                font-size: 16px;
                border-radius: 4px;
              }
              .footer {
                margin-top: 30px;
                font-size: 12px;
                color: #888888;
              }
            </style>
          </head>
          <body>
            <div class="container">
              ${content}
              <div class="footer">
                <p>Vui lòng không trả lời email này. Nếu bạn có thắc mắc, hãy liên hệ bộ phận hỗ trợ khách hàng.</p>
              </div>
            </div>
          </body>
        </html>
      `;

            switch (type) {
                case 'offer':
                    const product = task.variables.get("recommendedProduct") || {};

                    const rawLoanAmount = Number(customerData.loan_amount || 0);
                    const finalLoanAmount = rawLoanAmount < 100000 ? rawLoanAmount * 26 : rawLoanAmount;
                    const formattedLoanAmount = formatCurrencyVND(finalLoanAmount);

                    subject = '🎉 Chúc mừng! Đề nghị vay vốn của bạn đã được phê duyệt';
                    bodyContent = `
            <p>Chào ${customerData.full_name || 'quý khách'},</p>
            <p>Chúng tôi vui mừng thông báo rằng bạn đã được phê duyệt khoản vay với số tiền <strong>${formattedLoanAmount}</strong>.</p>
            <p>Để xác nhận và tiếp tục, vui lòng nhấn vào nút bên dưới:</p>
            <p>
              <a href="http://localhost:3000/accept-offer?applicationId=${customerData.application_id}" class="button">
                Đồng ý với Đề nghị
              </a>
            </p>
          `;
                    break;

                case 'rejection':
                    newStatus = 'REJECTED';
                    subject = '💼 Thông báo: Đơn vay của bạn chưa được phê duyệt';
                    bodyContent = `
            <p>Chào ${customerData.full_name || 'quý khách'},</p>
            <p>Sau khi xem xét, chúng tôi rất tiếc phải thông báo rằng đơn vay của bạn chưa được phê duyệt lần này.</p>
            <p>Rất mong sẽ được hỗ trợ bạn trong những cơ hội tiếp theo.</p>
          `;
                    break;

                case 'confirmation':
                    newStatus = 'COMPLETED';
                    subject = '✅ Khoản vay của bạn đã được giải ngân thành công';
                    bodyContent = `
            <p>Chào ${customerData.full_name || 'quý khách'},</p>
            <p>Chúng tôi xác nhận rằng khoản vay của bạn đã được giải ngân thành công.</p>
            <p>Cảm ơn bạn đã tin tưởng sử dụng dịch vụ của chúng tôi.</p>
          `;
                    break;

                case 'reminder':
                    subject = '🔔 Nhắc nhở: Vui lòng phản hồi đề nghị vay vốn';
                    bodyContent = `
            <p>Chào ${customerData.full_name || 'quý khách'},</p>
            <p>Chúng tôi thấy bạn chưa phản hồi về đề nghị vay vốn trước đó. Đề nghị sẽ sớm hết hạn, vui lòng phản hồi sớm nhất có thể.</p>
          `;
                    break;

                case 'managerInsights':
                    const insights = task.variables.get("insights") || "Không có phân tích chi tiết.";
                    recipientEmail = process.env.MANAGER_EMAIL || 'minhsadz@gmail.com';
                    subject = `[Cần xem xét] Đơn vay của khách hàng ${customerData.full_name || 'chưa rõ'} với thông tin từ LLM phản hồi ${insights}`;
                    bodyContent = `
            <p>Một đơn vay cần được xem xét thủ công bởi quản lý.</p>
            <p><strong>Phân tích từ hệ thống:</strong></p>
            <blockquote>${insights}</blockquote>
          `;
                    break;

                default:
                    console.warn(`Loại email không xác định: "${type}". Tác vụ sẽ được hoàn thành mà không gửi email.`);
                    return taskService.complete(task);
            }

            const body = emailTemplate(bodyContent);

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
