import { randomIndex } from './seed/utils/helpers.js'
import { startTimeOptions } from "./data/defaults/availability.js"

// Returns an availability array for a single day
export const generateRandomSingleDayAvailability = () => {
    const availability = []
    startTimeOptions
        .forEach((timeslot, idx) => {
            randomIndex(6) === 1 &&
            availability.push([timeslot, startTimeOptions[idx+1]])
    })
    return availability
};

// Samples users for testing and demo:
export const mockUsers = ['becca', 'logan', 'tommy', 'clara', 'charles'].map((user) => {
    return {
        id: user,
        availability: generateRandomSingleDayAvailability(),
    }
});


/**
 * Find Common Availability for a Set of Team Members for a Single Day

 * @param {Array<objects>} membersAvailabilities - final structure tbd, currently demo-mode
 *  id -> some identifier of user / member
 *  availability -> the availability object for a user for a single day
 * @returns {Object} keys = timeslots, values = array of users
 *  
 *   {
 *      '7:00 AM: ['tommy', 'logan', 'clara'],
 *      '12:30 PM': ['tommy'],
 *      '5:00 PM': ['becca', 'logan', 'tommy' 'clara'],
 *   }
 */

// final structure tbd, but this demo accepts a single member availability as
// availability -> the availability object for a user for a single day

const findCommonAvailability = (membersAvailabilities) => {
    const commonAvailability = {}
    startTimeOptions.forEach((timeslot) => {
        membersAvailabilities.forEach((member) => {
            if (member.availability[timeslot] === 'yes') {
                commonAvailability[timeslot] 
                    ? commonAvailability[timeslot].push(member.id) 
                    : commonAvailability[timeslot] = [member.id]
            }
        })
    })
    return commonAvailability
};

// const commonAvailability = findCommonAvailability(users)

// Takes in common availability, and a desired number of available members
// For a team of 5 members, 5 would be the ideal number
// Use case would be iterating starting with best case availability, aka 5
// then decrementing down to 4, 3, 2 members etc.
// Rework TBD on frontend usage / need
const findBestAvailability = (availabilities, numberOfMembers) => {
    const bestTimes = {}
    Object.keys(availabilities).forEach(time => {
        if (availabilities[time].length >= numberOfMembers ) {
            bestTimes[time] = availabilities[time]
        }
    })
    return bestTimes
}

// console.log('Checking common availability for 5 team members...')
// const bestAvailability = findBestAvailability(commonAvailability, 5)
// Object.keys(bestAvailability).forEach(timeslot => {
//     console.log(`At ${timeslot}, the following ${bestAvailability[timeslot].length} members are available: ${bestAvailability[timeslot].join(' ')}`)
// });



