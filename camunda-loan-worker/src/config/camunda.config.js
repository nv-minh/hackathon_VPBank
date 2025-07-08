module.exports = {
    baseUrl: process.env.CAMUNDA_BASE_URL || "http://localhost:8080/engine-rest",
    use: require("camunda-external-task-client-js").logger,
    asyncResponseTimeout: 10000,
};