import express from 'express';
import { someControllerFunction } from '../controllers/someController';

const router = express.Router();

// Define API endpoints
router.get('/some-endpoint', someControllerFunction);
router.post('/another-endpoint', someControllerFunction);

export default router;