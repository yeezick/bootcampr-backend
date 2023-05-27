import { Router } from 'express';
import * as controllers from '../../controllers/calendar/events.js';

const router = Router();

// event routes
// CREATE new meeting
// UPDATE single user attendence
// UPDATE start time
// UPDATE duration

router.post('/calendar/:calendarId/createEvent', controllers.createEvent);
router.get('/calendar/:calendarId/fetchEvent/:eventId', controllers.fetchEvent);

export default router;
