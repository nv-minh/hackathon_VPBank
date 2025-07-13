// /src/workers/validateData.worker.js

function registerValidateDataWorker(client) {
    client.subscribe("validateData", async ({ task, taskService }) => {
        console.log(`🛡️ Nhận được tác vụ [validateData]...`);
        const customerData = task.variables.get("customerData");

        if (1) {
            console.log("✅ Dữ liệu hợp lệ.");

            const processVariables = new Map();
            console.log("customerData",customerData)
            processVariables.set("customerData", customerData);

            await taskService.complete(task, processVariables);

        } else {
            console.error("❌ Dữ liệu không hợp lệ:", customerData);
            await taskService.handleBpmnError(task, "VALIDATION_ERROR", "Dữ liệu không hợp lệ.");
        }
    });
}

module.exports = registerValidateDataWorker;