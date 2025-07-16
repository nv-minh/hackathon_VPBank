const dbService = require("../services/database.service");

async function createProfileApplication(req, res) {
  const tokenContent = req.kauth.grant.access_token.content;
  const keycloakId = tokenContent.sub;
  if (!keycloakId) {
    return res.status(400).json({ message: "keycloakId là bắt buộc." });
  }

  try {
    const newProfileId = await dbService.createApplicationProfile(
      keycloakId,
      req.body
    );

    res.status(201).json({
      profileId: newProfileId,
      message: "Hồ sơ ứng tuyển đã được tạo thành công.",
    });
  } catch (error) {
    res.status(500).json({ message: "Tạo hồ sơ ứng tuyển thất bại." });
  }
}

module.exports = {
  createProfileApplication,
};
