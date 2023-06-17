import { Router } from 'express';
import {
  deleteAllCalendars,
  createCalendar,
  fetchAllCalendars,
  fetchCalendar,
} from '../../controllers/calendar/calendars.js';

const router = Router();

// calendar routes
// GET all meetings for a project
// GET all upcoming meetings for a project, 'x' number of days
// GET all meetings for a project in 'x' - 'y' date range

router.get('/calendar/:calendarId/fetchCalendar', fetchCalendar);
router.get('/calendar/fetchAllCalendars', fetchAllCalendars);
router.post('/calendar/createCalendar/:projectId', createCalendar);
router.delete('/calendar/deleteAllCalendars', deleteAllCalendars);

export default router;
