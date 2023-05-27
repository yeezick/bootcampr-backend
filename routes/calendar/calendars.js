import { Router } from 'express';
import * as controllers from '../../controllers/calendar/calendars.js';

const router = Router();

// calendar routes
// GET all meetings for a project
// GET all upcoming meetings for a project, 'x' number of days
// GET all meetings for a project in 'x' - 'y' date range

router.get('/calendar/:calendarId/fetchCalendar', controllers.fetchCalendar);
router.post('/calendar/createCalendar/:projectId', controllers.createCalendar);
router.delete('/calendar/deleteAllCalendars', controllers.deleteAllCalendars);

export default router;
