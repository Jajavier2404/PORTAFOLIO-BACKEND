"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const projectController_1 = require("../controllers/projectController");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Rutas públicas
router.get('/', projectController_1.projectController.getAll);
router.get('/:id', projectController_1.projectController.getById);
// Rutas protegidas (solo admin)
router.post('/', auth_1.authenticate, auth_1.authorizeAdmin, projectController_1.projectController.create);
router.put('/:id', auth_1.authenticate, auth_1.authorizeAdmin, projectController_1.projectController.update);
router.delete('/:id', auth_1.authenticate, auth_1.authorizeAdmin, projectController_1.projectController.delete);
exports.default = router;
//# sourceMappingURL=project.js.map