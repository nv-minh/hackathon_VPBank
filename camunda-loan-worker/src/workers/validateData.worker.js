function registerValidateDataWorker(client) {
    client.subscribe("validateData", async ({ task, taskService }) => {
        console.log(`⚡️ Nhận được tác vụ [validateData]...`);

        const customerData = task.variables.get("customerData");


        const isValid = true;

        if (isValid) {
            console.log(`✅ Dữ liệu của khách hàng ${customerData.customer_name} hợp lệ.`);
            await taskService.complete(task);
        } else {
            console.error("❌ Dữ liệu không hợp lệ.");
            await taskService.handleBpmnError(task, "VALIDATION_ERROR", "Dữ liệu không hợp lệ.");
        }
    });
}

module.exports = registerValidateDataWorker;