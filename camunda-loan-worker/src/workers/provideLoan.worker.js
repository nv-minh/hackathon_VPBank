
function registerProvideLoanWorker(client){
    client.subscribe("provideLoan", async ({ task, taskService }) => {
        console.log(`💸 Nhận được tác vụ [provideLoan]...`);

        const customerData = task.variables.get("customerData");
        const applicationId = customerData?.application_id || task.variables.get("applicationId");


        console.log(`✅ Mô phỏng giải ngân thành công cho đơn vay: ${applicationId}.`);

        await taskService.complete(task);
    });
}

module.exports = registerProvideLoanWorker