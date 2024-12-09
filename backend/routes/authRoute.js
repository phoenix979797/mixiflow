const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

router.post("/login", authController.login);
router.post("/register", authController.register);
router.post("/google-login", authController.googleLogin);
router.post("/notion-login", authController.notionLogin);
router.post("/twitter-login", authController.twitterLogin);
router.post("/instagram-login", authController.instagramLogin);
router.post("/linkedin-login", authController.linkedinLogin);
router.post("/calendly-login", authController.calendlyLogin);
router.post("/tiktok-login", authController.tiktokLogin);
router.post("/microsoft-teams-login", authController.microsoftTeamsLogin);
router.post("/microsoft-word-login", authController.microsoftWordLogin);
router.post("/outlook-login", authController.outlookLogin);
router.post("/slack-login", authController.slackLogin);
router.post("/calcom-login", authController.calcomLogin);
router.post("/stripe-login", authController.stripeLogin);
router.post("/whatsapp-login", authController.whatsappLogin);

module.exports = router;
