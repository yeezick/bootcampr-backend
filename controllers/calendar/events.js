import { formatCalendarId } from '../../utils/helperFunctions.js';
import { calendar } from '../../server.js';
import sgMail from '@sendgrid/mail';

// Potential New Controllers for Meetings
// Update Single User Attendence
// Update Duration
// Update Start time
// Get All Project Meetings
// Get All Project Meetings for 'x' number of days

export const createEvent = async (req, res) => {
  try {
    const { calendarId } = req.params;
    console.log('reqbod', req.body);
    // Sample event below
    const event = await calendar.events.insert(req.body);

    res.status(200).send(event);
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(400).send(error);
  }
};

export const fetchEvent = async (req, res) => {
  try {
    const { calendarId, eventId } = req.params;
    const event = await calendar.events.get({
      calendarId: formatCalendarId(calendarId),
      eventId,
    });
    res.status(200).send(event);
  } catch (error) {
    console.error('Error fetching event:', error);
    res.status(400).send(error);
  }
};

/*
const sampleNewEvent = {
    "calendarId": "gieggl7g0egdgdtptosvin5bno@group.calendar.google.com",
    "resource": {
        "description": "description",
        "summary": "1",
        "start": {
            "dateTime": "2023-05-29T16:00:00Z",
            "timeZone": "America/New_York"
        },
        "end": {
            "dateTime": "2023-05-29T17:00:00Z",
            "timeZone": "America/New_York"
        },
        "attendees": [
            {
                "email": "bootcamprcalendar@gmail.com"
            }
        ]
    },
    "sendUpdates": "all"
};
*/

/* Attempt at using SG to send emails -> not functional nor pretty
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const iCalContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//My Calendar//EN
BEGIN:VEVENT
UID:${event.data.id}
SUMMARY:${req.body.eventName}
DTSTART:${req.body.eventStartTime}
DTEND:${req.body.eventEndTime}
LOCATION:
DESCRIPTION:
ORGANIZER:MAILTO:${'erickmanriqpro@gmail.com'}
ATTENDEE;RSVP=TRUE;PARTSTAT=NEEDS-ACTION;ROLE=REQ-PARTICIPANT;CUTYPE=INDIVIDUAL;CN=${
  req.body.attendees[0].email
}:mailto:${req.body.attendees[0].email}
END:VEVENT
END:VCALENDAR`;

const base64Content = Buffer.from(iCalContent).toString('base64');

const msg = {
  to: req.body.attendees[0].email, // Change to your recipient
  from: `${process.env.EMAIL_SENDER}`, // Change to your verified sender
  subject: 'New event',
  text: `${req.body.description}`,
  // need to double check this ternary reads right
  attachments: [
    {
      content: base64Content,
      filename: 'invitation.ics',
      type: 'text/calendar',
      disposition: 'attachment',
    },
  ],
};
console.log('msg', msg);
sgMail
  .send(msg)
  .then(() => {
    console.log('Verification email sent successfully');
  })
  .catch((error) => {
    console.log('Email not sent');
    console.error(error.response.body);
  });
  */
