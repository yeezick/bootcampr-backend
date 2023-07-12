export const formatCalendarId = (id) => `${id}@group.calendar.google.com`;

// Converts query param attributes into the string format MongoDB expects
export const convertQueryAttributesToMongoString = (attributes) => {
    return attributes.replace(',', ' ')
}
