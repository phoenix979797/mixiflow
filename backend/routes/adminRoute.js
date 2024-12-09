const express = require("express");
const adminController = require("../controllers/adminController");
const authMiddleware = require("../middleware");
const router = express.Router();

// Protect all routes
router.use(authMiddleware.isAdmin);

router.get("/", adminController.getAllUsers);
router.post("/", adminController.createUser);
router.put("/:id", adminController.updateUser);
router.delete("/:id", adminController.deleteUser);
router.get("/:id/plans", adminController.getUserPlans);

module.exports = router;
