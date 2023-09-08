import { Router } from 'express';
import { updateAvailability } from '../../controllers/auth/auth.js';
// import controllers
const router = Router();

// Should user availability updates be controlled here as well? or in the user namespace?
router.post('/updateAvailability', updateAvailability);
// availability routes
// GET single user availability, single day
// GET single user availability, full week
// GET full team availability, single day
// GET full team availability, full week
// GET common availability for a team

export default router;
