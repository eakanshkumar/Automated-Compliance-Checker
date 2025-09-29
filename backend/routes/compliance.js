import express from 'express';
import { scanProduct, getComplianceReport } from '../controllers/complianceController.js';

const router = express.Router();

router.get('/report', getComplianceReport);
router.post('/scan/:productId', scanProduct);

export default router;