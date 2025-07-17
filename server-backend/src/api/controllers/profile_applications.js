const dbService = require("../services/database.service");

async function createProfileApplication(req, res) {
  try {
    const tokenContent = req.kauth.grant.access_token.content;
    const keycloakId = tokenContent.sub;
    const fullName = tokenContent.name;
    const email = tokenContent.email;

    if (!keycloakId) {
      return res.status(400).json({ message: "keycloakId là bắt buộc." });
    }

    const customerId = await dbService.findOrCreateCustomer(
      keycloakId,
      fullName,
      email
    );

    const newProfileId = await dbService.createApplicationProfile(
      keycloakId,
      req.body
    );

    res.status(201).json({
      profileId: newProfileId,
      message: "Hồ sơ ứng tuyển đã được tạo thành công.",
    });
  } catch (error) {
    console.error("Lỗi trong quá trình tạo hồ sơ ứng tuyển:", error);
    res.status(500).json({ message: "Tạo hồ sơ ứng tuyển thất bại." });
  }
}

module.exports = {
  createProfileApplication,
};
