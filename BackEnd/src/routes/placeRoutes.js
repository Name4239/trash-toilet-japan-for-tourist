// ลำดับอ่าน 2C: มาจาก server.js ที่ URL /api/places
// แต่ละบรรทัดเรียงเป็น Route → Auth → Zod Validation → Controller
// อ่านต่อที่ middlewares/, validations/ แล้วจบที่ controllers/placeController.js
import express from "express";
import {
  createPlace,
  deletePlace,
  getNearbyPlaces,
  getPendingPlaces,
  getPlaceById,
  getPlaces,
  updatePlaceStatus,
} from "../controllers/placeController.js";
import {
  authMiddleware,
  optionalAuthMiddleware,
} from "../middlewares/authMiddleware.js";
import { adminMiddleware } from "../middlewares/adminMiddleware.js";
import { uploadPlaceImage } from "../middlewares/uploadMiddleware.js";
import { validate } from "../middlewares/validateMiddleware.js";
import {
  createPlaceSchema,
  nearbyQuerySchema,
  placeIdSchema,
  placesQuerySchema,
  placeStatusSchema,
} from "../validations/schemas.js";

const router = express.Router();

// Route คำเฉพาะต้องอยู่ก่อน /:id ไม่เช่นนั้น Express จะคิดว่า nearby คือ id
router.get("/nearby", validate(nearbyQuerySchema, "query"), getNearbyPlaces);
router.get("/pending", authMiddleware, adminMiddleware, getPendingPlaces);

router.get(
  "/",
  optionalAuthMiddleware,
  validate(placesQuerySchema, "query"),
  getPlaces
);
router.get("/:id", validate(placeIdSchema, "params"), getPlaceById);
router.post(
  "/",
  authMiddleware,
  uploadPlaceImage,
  validate(createPlaceSchema),
  createPlace
);
router.delete(
  "/:id",
  authMiddleware,
  adminMiddleware,
  validate(placeIdSchema, "params"),
  deletePlace
);
router.patch(
  "/:id/status",
  authMiddleware,
  adminMiddleware,
  validate(placeIdSchema, "params"),
  validate(placeStatusSchema),
  updatePlaceStatus
);

export default router;
