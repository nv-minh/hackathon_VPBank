const { SESClient, SendEmailCommand } = require("@aws-sdk/client-ses");

const sesClient = new SESClient({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

/**
 * Hàm gửi email sử dụng AWS SES
 * @param {string} to - Địa chỉ email người nhận
 * @param {string} subject - Tiêu đề email
 * @param {string} body - Nội dung email (hỗ trợ HTML)
 */
async function sendEmail(to, subject, body) {
    const from = process.env.AWS_SES_VERIFIED_EMAIL;

    const params = {
        Source: from,
        Destination: {
            ToAddresses: [to],
        },
        Message: {
            Subject: {
                Data: subject,
                Charset: 'UTF-8',
            },
            Body: {
                Html: {
                    Data: body,
                    Charset: 'UTF-8',
                },
            },
        },
    };

    try {
        const command = new SendEmailCommand(params);
        const data = await sesClient.send(command);
        console.log(`✅ Email đã được gửi thành công đến ${to}. MessageId:`, data.MessageId);
        return data;
    } catch (error) {
        console.error("❌ Lỗi khi gửi email:", error);
        throw error;
    }
}

module.exports = { sendEmail };