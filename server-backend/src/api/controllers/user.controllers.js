const dbService = require("../services/database.service");

async function getUserInfo(req, res) {
  try {
    const tokenContent = req.kauth.grant.access_token.content;
    const keycloakId = tokenContent.sub;
    console.log("keycloakId", keycloakId);

    const profileResult = await dbService.findProfileIdByKeycloakId(keycloakId);

    if (profileResult?.rows?.length === 0) {
      return res
        .status(404)
        .json({ message: "Application profile not found for this customer." });
    }

    const profileId = profileResult?.rows?.[0]?.profile_id;

    res.status(200).json({
      hasProfile: !!profileId,
      message: "Profile ID retrieved successfully.",
    });
  } catch (error) {
    console.error("Error in getUserInfo:", error);
    res.status(500).json({
      message: "Failed to retrieve user information.",
      error: error.message,
    });
  }
}

module.exports = { getUserInfo };
