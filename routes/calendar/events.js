import { Router } from 'express';
import { createEvent, deleteCalendarEvents, fetchEvent, updateEvent, deleteEvent} from '../../controllers/calendar/events.js';
const router = Router();

// event routes
// CREATE new meeting
// UPDATE single user attendence
// UPDATE start time
// UPDATE duration

router.post('/calendar/:calendarId/createEvent', createEvent);
router.put('/calendar/:calendarId/updateEvent/:eventId', updateEvent);
router.get('/calendar/:calendarId/fetchEvent/:eventId', fetchEvent);
router.delete('/calendar/:calendarId/events', deleteCalendarEvents);
router.delete('/calendar/:calendarId/fetchEvent/:eventId', deleteEvent);

export default router;
