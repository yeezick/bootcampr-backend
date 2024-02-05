import { randomIndex } from './seed/utils/helpers.js'

/**
 * Uses realistic time slot options to generate random availability for a single day
 */
export const generateRealisticSingleDayAvailability = () => {
    return [commonAvailableTimeslots[randomIndex(commonAvailableTimeslots.length)]]
}

/**
 * Convert User Friendly time slot to Logical Availability
 */
const convertUserFriendlyTimeSlotToLogical = (startTime, endTime)=> {
    const startIndex = userFriendlyTimes.indexOf(startTime)
    const endIndex = userFriendlyTimes.indexOf(endTime)
    let logicalArray = []

    for (let i = startIndex; i < endIndex; i++) {
        logicalArray.push(i)
    }
    return logicalArray
}

/**
 * Convert Logical Availabilty to User Friendly
 */
const convertLogicalToUserFriendly = (logical) => {
    let userFriendly = [userFriendlyTimes[logical[0]]]

    for (let i = 1; i < logical.length; i++) {
        if (logical[i] - logical[i - 1] === 1) {
            if (i === logical.length - 1) {
                userFriendly.push(userFriendlyTimes[logical[i] + 1])
            }
        } else {
            const indexBefore = logical[i - 1]

            userFriendly.push(userFriendlyTimes[indexBefore + 1])
            userFriendly.push(userFriendlyTimes[logical[i]])

            if (i === logical.length - 1) {
                userFriendly.push(userFriendlyTimes[logical[i] + 1])
            }
        }
    }
    const convertedUserFriendly = []

    for (let i = 0; i < userFriendly.length; i += 2) {
        convertedUserFriendly.push([userFriendly[i], userFriendly[i + 1]])
    }

    return convertedUserFriendly
}


/**
 * TODO: Find Common Availability for a Set of Team Members for a Single Day
 * Takes in an array of users, returns an availability object of a the common availabilty for given users
 */

export const findCommonAvailability = (members) => {
    const commonAvailability = {};

    const logicalAvails = members.map((member) => {
        const logicalAvail = {}

        weekdays.forEach((weekday) => {
            const memberDayAvail = member.availability[weekday].availability;
            const wholeDay = [];

            memberDayAvail.forEach((timeslot) => {
                if (timeslot) {
                    const logicalSlot = convertUserFriendlyTimeSlotToLogical(...timeslot)
                    wholeDay.push(...logicalSlot)
                }
            logicalAvail[weekday] = wholeDay
            })
        })

        return logicalAvail
    })

    const logicalCommonAvailability = {};

    weekdays.forEach((day) => {
        let sharedDayAvail = [];

        for (let i = 0; i < userFriendlyTimes.length; i++) {
            if (allMembersAvailable(logicalAvails, day, i)) {
                sharedDayAvail.push(i)
            }
        }

        logicalCommonAvailability[day] = sharedDayAvail
    })

    weekdays.forEach((day) => {
        const converted = convertLogicalToUserFriendly(logicalCommonAvailability[day])
        if (converted[0][0]) { 
            commonAvailability[day] = converted 
        }
    })

    return commonAvailability
}

const allMembersAvailable = (avail, day, i) => {
    let allAvail = true;

    avail.forEach(member => {
        if (!member[day] || !member[day].includes(i)) {
            allAvail = false
        }
    })

    return allAvail
}

const weekdays = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']

/**
 * Realistic Available time slots
 */
const commonAvailableTimeslots = [
    ['7:00 AM', '9:30 AM'],
    ['7:00 AM', '1:00 PM'],
    ['9:00 AM', '12:00 PM'],
    ['9:00 AM', '9:00 PM'],
    ['10:00 AM', '1:00 PM'],
    ['10:00 AM', '7:00 PM']
    ['11:00 AM', '6:30 PM'],
    ['12:00 PM', '5:30 PM'],
    ['1:00 AM', '6:30 PM'],
    ['2:00 PM', '7:00 PM'],
    ['2:00 PM', '8:30 PM'],
    ['5:30 PM', '9:00 PM'],
    ['8:00 PM', '11:00 PM'],
    ['9:00 AM', '5:00 PM'],
    ['5:00 PM', '11:00 PM'],
    ['6:00 PM', '9:00 PM']
]

export const userFriendlyTimes = [
    '12:00 AM',
    '12:30 AM',
    '1:00 AM',
    '1:30 AM',
    '2:00 AM',
    '2:30 AM',
    '3:00 AM',
    '3:30 AM',
    '4:00 AM',
    '4:30 AM',
    '5:00 AM',
    '5:30 AM',
    '6:00 AM',
    '6:30 AM',
    '7:00 AM',
    '7:30 AM',
    '8:00 AM',
    '8:30 AM',
    '9:00 AM',
    '9:30 AM',
    '10:00 AM',
    '10:30 AM',
    '11:00 AM',
    '11:30 AM',
    '12:00 PM',
    '12:30 PM',
    '1:00 PM',
    '1:30 PM',
    '2:00 PM',
    '2:30 PM',
    '3:00 PM',
    '3:30 PM',
    '4:00 PM',
    '4:30 PM',
    '5:00 PM',
    '5:30 PM',
    '6:00 PM',
    '6:30 PM',
    '7:00 PM',
    '7:30 PM',
    '8:00 PM',
    '8:30 PM',
    '9:00 PM',
    '9:30 PM',
    '10:00 PM',
    '10:30 PM',
    '11:00 PM',
    '11:30 PM',
]