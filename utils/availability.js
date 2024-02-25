import { randomIndex } from './seed/utils/helpers.js'
import { commonAvailableTimeslots, userFriendlyTimes, weekdays } from './data/defaults/availability.js'

/**
 * Uses realistic time slot options to generate random availability for a single day
 */
export const generateRealisticSingleDayAvailability = () => {
    return [commonAvailableTimeslots[randomIndex(commonAvailableTimeslots.length)]]
}

/**
 * Convert User Friendly time slot to Logical Availability
 */
export const convertUserFriendlyTimeSlotToLogical = (startTime, endTime)=> {
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
    let userFriendly = [userFriendlyTimes[logical[0]]];

    if (logical.length === 1) {
        userFriendly.push(userFriendlyTimes[logical[0]+ 1])
    }

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