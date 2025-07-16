const axios = require("axios");
const config = require("../../config");

async function startProcess(applicationId) {
  const url = `${config.camunda.restUrl}/process-definition/key/${config.camunda.processKey}/start`;
  console.log("url", url);

  const payload = {
    variables: {
      applicationId: {
        value: applicationId,
        type: "String",
      },
    },
    businessKey: applicationId,
  };

  try {
    const response = await axios.post(url, payload);
    console.log("Camunda process started successfully:", response.data.id);
    return response.data;
  } catch (error) {
    console.error(
      "Failed to start Camunda process:",
      error.response?.data || error.message
    );
    throw new Error("Could not start Camunda process");
  }
}

module.exports = { startProcess };
