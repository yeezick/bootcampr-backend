export const dateBase = {
    weekday: '',
    month: '',
    day: '',
    year: '',
    time: '',
    timezoneAdjustment: '',
    timezoneString: '',
};

// Default Availability structure for a single day - used as base for new users
// AKA - zero availability to start
export const defaultSingleDayAvailability = {
    '12:00 AM': 'no',   '12:30 AM': 'no',   '1:00 AM': 'no',    '1:30 AM': 'no',
    '2:00 AM': 'no',    '2:30 AM': 'no',    '3:00 AM': 'no',    '3:30 AM': 'no',
    '4:00 AM': 'no',    '4:30 AM': 'no',    '5:00 AM': 'no',    '5:30 AM': 'no',
    '6:00 AM': 'no',    '6:30 AM': 'no',    '7:00 AM': 'no',    '7:30 AM': 'no',
    '8:00 AM': 'no',    '8:30 AM': 'no',    '9:00 AM': 'no',    '9:30 AM': 'no',
    '10:00 AM': 'no',   '10:30 AM': 'no',   '11:00 AM': 'no',   '11:30 AM': 'no',
    '12:00 PM': 'no',   '12:30 PM': 'no',   '1:00 PM': 'no',    '1:30 PM': 'no',
    '2:00 PM': 'no',    '2:30 PM': 'no',    '3:00 PM': 'no',    '3:30 PM': 'no',
    '4:00 PM': 'no',    '4:30 PM': 'no',    '5:00 PM': 'no',    '5:30 PM': 'no',
    '6:00 PM': 'no',    '6:30 PM': 'no',    '7:00 PM': 'no',    '7:30 PM': 'no',
    '8:00 PM': 'no',    '8:30 PM': 'no',    '9:00 PM': 'no',    '9:30 PM': 'no',
    '10:00 PM': 'no',   '10:30 PM': 'no',   '11:00 PM': 'no',   '11:30 PM': 'no',
};

// full array of timeslot options
export const startTimeOptions = Object.keys(defaultSingleDayAvailability)