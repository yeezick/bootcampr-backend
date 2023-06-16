import { Router } from 'express';
import * as controllers from '../../controllers/calendar/meetings.js';

const router = Router();

// meeting routes
// CREATE new meeting
// UPDATE single user attendence
// UPDATE start time
// UPDATE duration
// GET all meetings for a project
// GET all upcoming meetings for a project, 'x' number of days
// GET all meetings for a project in 'x' - 'y' date range

router.get('/calendar/createEvent', controllers.createEvent);
router.get('/calendar/fetchEvent/:calendarId/:eventId', controllers.fetchEvent);
router.get('/calendar/fetchCalendar/:calendarId', controllers.fetchCalendar);
router.post('/calendar/createCalendar/:projectId', controllers.createCalendar);

export default router;
