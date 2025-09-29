import express from 'express';
import { testScrape } from '../controllers/scrapeController.js';

const router = express.Router();

router.post('/test', testScrape);

export default router;