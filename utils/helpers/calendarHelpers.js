export const convertGoogleEventsForCalendar = (googleEvents) => {
  if (!googleEvents) {
    return [];
  }

  const convertedEvents = [];
  for (const singleEvent of googleEvents) {
    const { attendees, creator, description, end, id, location, start, summary, ...metadata } = singleEvent;
    const currentEvent = {
      attendees: attendees || null,
      creator,
      // Todo: FullCalendar handles time conversions in an unusual way, saving them as UTC instead of as ISO acounting for TZ. This is a workaround.
      gDateFields: {
        endTime: end.dateTime,
        startTime: start.dateTime,
      },
      description: description || null,
      end: end.dateTime,
      eventId: id,
      location,
      metadata,
      start: start.dateTime,
      timeZone: start.timeZone,
      title: summary,
    };

    convertedEvents.push(currentEvent);
  }
  return convertedEvents;
};
