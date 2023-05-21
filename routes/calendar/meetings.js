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

router.get('/calendar/:calendarId/createEvent', controllers.createEvent);
router.get('/calendar/:calendarId/fetchEvent/:eventId', controllers.fetchEvent);
router.get('/calendar/:calendarId/fetchCalendar', controllers.fetchCalendar);
router.post('/calendar/createCalendar/:projectId', controllers.createCalendar);
router.get('/calendar/deleteAll', controllers.deleteAllCalendars);

export default router;
