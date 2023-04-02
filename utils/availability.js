import { randomIndex } from './seed/utils/helpers.js'
import { dateBase, startTimeOptions, defaultSingleDayAvailability } from "./data/defaults/availability.js"
// import { mockUsers } from "./data/mocks/availability.js"

//  - Ideally, we would only store times in which is a user is available vs. not 

// Date.now() = Number representing time passed since a certain date
// Date.UTC() = 

// Get current Date and convert into a date object
// const dateArray = Date().split(' ')
// dateArray[6] = dateArray.slice(6,10).join(' ')
// Object.keys(dateBase).forEach(key => date[key] = nowArray.shift())

// returns an availability object for a single day
export const generateRandomSingleDayAvailability = () => {
    const availability = {}
    Object.keys(defaultSingleDayAvailability)
        .forEach((timeslot) => {
            randomIndex(6) === 1 ?
            availability[timeslot] = "yes"
            : null
    })
    return availability
};

// console.log(users)

// Samples users for testing and demo:
export const mockUsers = ['becca', 'logan', 'tommy', 'clara', 'charles'].map((user) => {
    return {
        id: user,
        availability: generateRandomSingleDayAvailability(),
    }
});


/**
 * Find Common Availability for a Set of Team Members for a Single Day
 * 
 * 
 * 
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
    // could i also do for const key of ...?
    Object.keys(defaultSingleDayAvailability).forEach((timeslot) => {
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



