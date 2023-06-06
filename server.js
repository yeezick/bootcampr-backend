import 'dotenv/config.js';
import db from './db/connection.js';
import express from 'express';
import logger from 'morgan';
import cors from 'cors';
import routes from './routes/index.js';
import * as io from 'socket.io';
import { createServer } from 'http';
import PushNotifications from './models/notifications.js';
import User from './models/user.js';
import { google } from 'googleapis';

// export const auth = new google.auth.GoogleAuth({
//   // credentials: JSON.parse(process.env.CALENDAR_CREDS),
//   keyFilename: './calendarSecret.json',
//   scopes: ['https://www.googleapis.com/auth/calendar'],
//   // subject: 'erick.manrique@bootcampr.io',
// });

export const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: 'scheduler@bootcampr-calendar.iam.gserviceaccount.com',
    private_key:
      '-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDY5RRLL4SxaJNo\nxeySE/V23xGFACoc5KeVMF3b9Yt+kKlyKgrHJfUfRLglLlK8CUnmaGKEGtDr22eZ\nPKIkIHEguu3mHUQ2Z8tnsVksRrl7NEJgoro5mD97axRTYMoZ2OJCglnvlFfaF8kZ\nHsCtkZ1VZUjci9gzPpwpixlqM+7mDPZ3I4bFQxAq7d36X49fxb3c4uqZBTm+6Iun\nKJsMXvg/kHPcfDaLoSsUCRc+tGp2zL+z/Mb42zv1QtcFO589Kr8bhwDELstpWc1Y\nmm3UJVNV5fR/rkaUD19XAoCru13qryLKttn2ddeu7wW4TX7OV2GWBiWnvUSNUALW\nv3viKgCdAgMBAAECggEAGyKZ0Ig64n58sWcltZGKrFsJvukqMPWIY86qch+SWqdw\nPj4KnXy0YeY/4DhJ6zLW9zJdtOetS1IRRXzDpPUWwitbd7vMnL6NQO/8AeE9SQUy\nPWh5F5s3wfyVDT4MOtdFWLXPLlKRpSbu/AC6xrGeN0tV0MXW1XPCp3iQGZcyub7F\nddoIxrIF8Q7Gc0DG9rq1MD2NXtONUzt4SrqKtyF7jd54jZyuBLDKNfehb0Z15BQv\nuOu4+W5XUMOBowvPxeZ7JL43HjBy+mb37xi9yA51VbX5TQkoR77NSwRzeJjCCvhT\nel7oML5/NYvvllsiLUb6jberp0shnBUOFE+mrxSPrwKBgQDulsgPVVtSPnfzynDK\ns44QzjBM0cph1V9eblqRon+5usD7bJznIU1wKcWpy7F0oRxMdY2GalgAhfS+0oUx\n2CC0t8DCUcuWPwV2458fKKBxXURFh09FPGaGUYHDsHWq2aucrboH1o9DGjV0ICQj\nPzYzA6CRW3tgA20awtsZz6r3PwKBgQDouQRR7nerQqjgC0/RNAaODLkiGTvD08Jc\nOLC5wlSEG77Myvu1WIk/t8v/pbBy/AM/n83i3kQuQBYYM5/33v9cbkZa3h6LND/g\nWZQKxa0bKngNiHMSUfghoAWDVndxeeEWPc0O/7mfBgmyk8XoPFZ6p8mplRyhqH1m\n2eeGvcQNIwKBgQDRMCjGsOs5yAW6HdQZFadI+s+Eeyh78O4GSLFmIVjlimWrzEYh\nrKRN5IInZq33eU7rhuIIaXMxOkIlkUUxN7MtYDNE7RyYZjcvT1HzqtZJryGt6H5L\nUTL/L7Wb0zrICsOZwwRp3OiNSAx3/bpRoRmvTs3YxKH+w+JEZXZfQiI/VwKBgQC1\nCMAQkCXtRqSh7IrBnev/cmxN1z1Dn6YRIVRwnHgscHzjSH+32VCjDXIWw6hYOiy4\nwLJjai21oMrPNtGY+5LAL1RxeVpfRVzvRB/CpXV8rXPIaz3AoZ0ZYycGvSubTYlI\nSPkMUuftib/fd867UryfG4jnb4RfSPeMG7Rcf6BT6wKBgE1XjwZm3FwfXw8YOdum\nAN9QEtKK97jxV5xuB8Peg5W1UToBbPD6WDhts0lh7sl2TUhA5HFJ/BWGIoozvIUp\nIY4d08oVcA2k1VKyn+3ubkLamC75zPRxadiuR+ddD0wauqHtw4t3O+Qk00q68tSx\nm2EqZ1DP4TE1aZV5FwouG0DZ\n-----END PRIVATE KEY-----\n',
    user_email: 'erick.manrique@bootcampr.io',
  },
  scopes: ['https://www.googleapis.com/auth/calendar'],
});
console.log('auth-before', auth);

// const authClient = await auth.getClient();
// console.log('authClient', authClient);
// auth.subject = 'erick.manrique@bootcampr.io';
console.log('auth-after', auth);

export const calendar = google.calendar({ version: 'v3', auth });

const app = express();
const PORT = process.env.PORT || 8001;

const server = createServer(app);
const socketio = new io.Server(server, db, {
  cors: {
    transports: ['websocket'],
    origin: '*',
    credentials: true,
  },
});

app.use(cors());
app.use(express.json());
app.use(logger('dev'));
app.use(routes);

socketio.on('connection', (socket) => {
  socket.on('setUserId', async (userId) => {
    if (userId) {
      const oneUser = await User.findById(userId).lean().exec();
      if (oneUser) {
        console.log(`Socket: User with id ${userId} has connected.`);
      } else {
        console.log(`No user with id ${userId}`);
      }
    }
    PushNotifications.watch().on('change', async () => {
      const notifications = await PushNotifications.find({ user: userId, read: false }).lean();
      socket?.emit('notificationsLength', notifications.length || 0);
    });
    socket.on('disconnect', () => {
      userId = null;
    });
  });
});

server.listen(PORT, () => {
  console.log(`Express server application is running on port: ${PORT}\n\n`);
});
