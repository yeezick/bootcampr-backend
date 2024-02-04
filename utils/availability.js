import { randomIndex } from './seed/utils/helpers.js'
import { startTimeOptions } from "./data/defaults/availability.js"
import { generateFakeUser } from './seed/utils/users.js';

// TODO: swap // comments for /** */ style descriptions

// Returns randomly generated availability array for a single day
export const generateRandomSingleDayAvailability = () => {
    const availability = []
    startTimeOptions
        .forEach((timeslot, idx) => {
            randomIndex(6) === 1 &&
            availability.push([timeslot, startTimeOptions[idx+1]])
    })
    return availability
};

// Returns a realistic availability frame for a single day
export const generateRealisticSingleDayAvailability = () => {
    let availability = [];

    const randomSlot = commonAvailableTimeslots[randomIndex(commonAvailableTimeslots.length)]
    availability.push(randomSlot)

    return availability
}

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
            ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].forEach((day) => {
                console.log(member.availability[day].availability)
            })
            // console.log(member.availability)
            
            // if (member.availability[timeslot] === 'yes') {
            //     commonAvailability[timeslot] 
            //         ? commonAvailability[timeslot].push(member.id) 
            //         : commonAvailability[timeslot] = [member.id]
            // }
        })
    })
    return commonAvailability
};

// const user1 = await generateFakeUser()
// const user2 = await generateFakeUser()
// const user3 = await generateFakeUser()

// const commonAvailability = findCommonAvailability([user1, user2, user3])
// console.log(commonAvailability)

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



