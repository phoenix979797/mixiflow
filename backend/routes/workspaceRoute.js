const express = require("express");
const router = express.Router();
const workspaceController = require("../controllers/workspaceController");

router.get("/", workspaceController.getWorkspaces);
router.post("/create", workspaceController.createWorkspace);
router.get("/:id", workspaceController.getWorkspaceById);
router.post("/:id", workspaceController.updateWorkspace);

module.exports = router;
