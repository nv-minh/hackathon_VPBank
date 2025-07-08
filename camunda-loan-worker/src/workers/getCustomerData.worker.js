function registerGetCustomerDataWorker(client) {
    client.subscribe("getCustomerData", async ({ task, taskService }) => {
        console.log(`⚡️ Nhận được tác vụ [getCustomerData]...`);

        const fakeCustomerData = {
            application_id: task.variables.get("applicationId") || 'app-fake-01',
            customer_name: 'Nguyen Van Test',
            credit_score: 750,
            annual_salary: 90000000
        };
        console.log("✅ [TEST] Đã tạo dữ liệu khách hàng giả:", fakeCustomerData);

        const processVariables = new Map();
        processVariables.set("customerData", fakeCustomerData);

        await taskService.complete(task, processVariables);
    });
}

module.exports = registerGetCustomerDataWorker;


// const pool = require("../services/postgres.service");
//
// function registerGetCustomerDataWorker(client) {
//     client.subscribe("getCustomerData", async ({ task, taskService }) => {
//         console.log(`⚡️ Nhận được tác vụ [getCustomerData]...`);
//
//         const applicationId = task.variables.get("applicationId");
//
//         if (!applicationId) {
//             console.error("Lỗi: Không tìm thấy 'applicationId'.");
//             return await taskService.handleFailure(task, {
//                 errorMessage: "Thiếu applicationId."
//             });
//         }
//
//         console.log(`...đang tìm dữ liệu cho applicationId: ${applicationId}`);
//
//         try {
//             const query = 'SELECT * FROM customers WHERE application_id = $1';
//             const { rows } = await pool.query(query, [applicationId]);
//
//             if (rows.length === 0) {
//                 console.error(`Lỗi: Không có khách hàng nào với applicationId = ${applicationId}`);
//                 return await taskService.handleBpmnError(
//                     task, "CUSTOMER_NOT_FOUND", `Không tìm thấy dữ liệu khách hàng.`
//                 );
//             }
//
//             const customerData = rows[0];
//             console.log("✅ Lấy dữ liệu khách hàng thành công.");
//
//             const processVariables = new Map();
//             processVariables.set("customerData", customerData);
//
//             await taskService.complete(task, processVariables);
//         } catch (error) {
//             console.error("❌ Lỗi khi truy vấn CSDL:", error);
//             await taskService.handleFailure(task, {
//                 errorMessage: "Có lỗi xảy ra với CSDL.",
//                 errorDetails: error.stack,
//             });
//         }
//     });
// }
//
// module.exports = registerGetCustomerDataWorker;

