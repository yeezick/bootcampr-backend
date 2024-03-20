import { Router } from 'express';
import {
  deleteAllCalendars,
  createCalendar,
  fetchAllCalendars,
  fetchCalendar,
  fetchUserCalendar,
} from '../../controllers/calendar/calendars.js';

const router = Router();

// calendar routes
// GET all meetings for a project
// GET all upcoming meetings for a project, 'x' number of days
// GET all meetings for a project in 'x' - 'y' date range
router.get('/calendar/fetchAllCalendars', fetchAllCalendars);
router.get('/calendar/:calendarId/fetchCalendar', fetchCalendar);
router.get('/calendar/:calendarId/fetchCalendar/:userEmail', fetchUserCalendar);
router.post('/calendar/createCalendar/:projectId', createCalendar);
router.delete('/calendar/deleteAllCalendars', deleteAllCalendars);

export default router;