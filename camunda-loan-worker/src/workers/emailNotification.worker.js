const { sendEmail } = require('../services/email.service');

function registerEmailNotificationWorker(client) {
    client.subscribe("sendEmailNotification", async ({ task, taskService }) => {
        console.log(`📧 Nhận được tác vụ [sendEmailNotification]...`);

        try {
            const customerData = task.variables.get("customerData");
            const loanResults = task.variables.get("loan_results");

            if (!customerData || !loanResults) {
                throw new Error("Thiếu thông tin khách hàng hoặc kết quả khoản vay.");
            }

            const recipientEmail = customerData.email;
            let subject = '';
            let body = '';

            if (loanResults.decision === 'Approved') {
                subject = 'Chúc mừng! Đơn vay của bạn đã được phê duyệt';
                body = `
                    Chào ${customerData.full_name},<br><br>
                    Chúng tôi vui mừng thông báo đơn vay của bạn đã được phê duyệt với số tiền là ${loanResults.approved_amount}.<br><br>
                    Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi.
                `;
            } else {
                subject = 'Thông báo về đơn vay của bạn';
                body = `
                    Chào ${customerData.full_name},<br><br>
                    Sau khi xem xét, chúng tôi rất tiếc phải thông báo rằng đơn vay của bạn chưa được phê duyệt lần này.<br><br>
                    Lý do: ${loanResults.reason}.
                `;
            }

            await sendEmail(recipientEmail, subject, body);

            console.log(`👍 Hoàn thành tác vụ gửi email đến ${recipientEmail}.`);
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