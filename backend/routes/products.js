import express from 'express';
import { scanProduct, getProduct, getAllProducts } from '../controllers/productController.js';

const router = express.Router();

router.post('/scan', scanProduct);
router.get('/', getAllProducts);
router.get('/:productId', getProduct);

export default router;