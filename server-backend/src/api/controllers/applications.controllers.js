const dbService = require('../services/database.service');
const camundaService = require('../services/camunda.service');

async function createApplication(req, res) {
    try {
        // const tokenContent = req.kauth.grant.access_token.content;
        // const keycloakId = tokenContent.sub;
        // const name = tokenContent.name;
        // const email = tokenContent.email;
        const keycloakId = '5ede2850-11cb-44b6-b394-67ea2d711bbe'
        const requestBody = req.body;
        const hasNewData = requestBody && Object.keys(requestBody).length > 1;

        let applicationData;

        if (hasNewData) {
            // **KỊCH BẢN 1: Có dữ liệu mới từ Form**
            console.log("DEBUG - Nhận được dữ liệu mới từ request body.");
            applicationData = requestBody;
        } else {
            // **KỊCH BẢN 2: Không có dữ liệu, chạy luồng Test**
            console.log("DEBUG - Không có dữ liệu, chạy luồng test bằng dữ liệu cũ.");
            console.log("requestBody",requestBody)
            const latestApplication = await dbService.findAndOptionalUpdateProfile(keycloakId,requestBody?.loanAmount/26);

            if (!latestApplication) {
                return res.status(404).json({ message: "Không tìm thấy đơn vay cũ để thực hiện test." });
            }
            applicationData = latestApplication;
        }

        // --- Bước 3: Tìm hoặc tạo Customer ---
        // const customerId = await dbService.findOrCreateCustomer(keycloakId, email, name);
        // console.log("DEBUG - Customer ID:", customerId);

        // --- Bước 4: Kiểm tra đơn vay đang hoạt động (chống spam) ---
        const activeApplication = await dbService.findActiveApplicationByCustomerId(applicationData.customer_id);
        console.log("activeApplication",activeApplication)
        if (activeApplication) {
            return res.status(409).json({
                message: "Bạn đã có một đơn vay đang hoạt động. Vui lòng chờ xử lý.",
                applicationId: activeApplication.application_id,
                status: activeApplication.status
            });
        }

        // --- Bước 5: Tạo các record mới ---
        // const profileId = await dbService.createApplicationProfile(applicationData.customer_id, applicationData);
        // console.log("DEBUG - New Profile ID:", profileId);

        const loanApplicationId = await dbService.createLoanApplication(applicationData.customer_id, applicationData.profile_id);
        console.log("DEBUG - New Application ID:", loanApplicationId);

        // --- Bước 6: Khởi tạo quy trình Camunda ---
        const processInstance = await camundaService.startProcess(String(loanApplicationId));
        await dbService.updateApplicationWithProcessId(loanApplicationId, processInstance.id);

        res.status(201).json({
            message: 'Application submitted and process started.',
            loanApplicationId: loanApplicationId,
            processInstanceId: processInstance.id,
        });

    } catch (error) {
        console.error('Error creating application:', error);
        res.status(500).json({ message: 'Failed to create application.' });
    }
}

module.exports = { createApplication };