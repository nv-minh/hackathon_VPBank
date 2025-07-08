// src/workers/calculateLoanResultsAI.worker.js (Bản dùng để test)

function registerCalculateLoanResultsAIWorker(client) {
    client.subscribe("calculateLoanResultsAI", async ({ task, taskService }) => {
        console.log(`⚡️ Nhận được tác vụ [calculateLoanResultsAI]...`);

        const fakeAiDecision = {
            decision: "approve"
        };
        console.log("✅ [TEST] Đã tạo quyết định AI giả:", fakeAiDecision);

        const processVariables = new Map();
        processVariables.set("loan_results", fakeAiDecision);

        await taskService.complete(task, processVariables);
    });
}

module.exports = registerCalculateLoanResultsAIWorker;