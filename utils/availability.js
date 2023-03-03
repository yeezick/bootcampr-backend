// Run node availability.js to demo

// Default Availability structure for a single day - used as base for new users
// AKA - zero availability to start
export const defaultSingleDayAvailability = {
    '12:00 AM': 'no',
    '12:30 AM': 'no',
    '1:00 AM': 'no',
    '1:30 AM': 'no',
    '2:00 AM': 'no',
    '2:30 AM': 'no',
    '3:00 AM': 'no',
    '3:30 AM': 'no',
    '4:00 AM': 'no',
    '4:30 AM': 'no',
    '5:00 AM': 'no',
    '5:30 AM': 'no',
    '6:00 AM': 'no',
    '6:30 AM': 'no',
    '7:00 AM': 'no',
    '7:30 AM': 'no',
    '8:00 AM': 'no',
    '8:30 AM': 'no',
    '9:00 AM': 'no',
    '9:30 AM': 'no',
    '10:00 AM': 'no',
    '10:30 AM': 'no',
    '11:00 AM': 'no',
    '11:30 AM': 'no',
    '12:00 PM': 'no',
    '12:30 PM': 'no',
    '1:00 PM': 'no',
    '1:30 PM': 'no',
    '2:00 PM': 'no',
    '2:30 PM': 'no',
    '3:00 PM': 'no',
    '3:30 PM': 'no',
    '4:00 PM': 'no',
    '4:30 PM': 'no',
    '5:00 PM': 'no',
    '5:30 PM': 'no',
    '6:00 PM': 'no',
    '6:30 PM': 'no',
    '7:00 PM': 'no',
    '7:30 PM': 'no',
    '8:00 PM': 'no',
    '8:30 PM': 'no',
    '9:00 PM': 'no',
    '9:30 PM': 'no',
    '10:00 PM': 'no',
    '10:30 PM': 'no',
    '11:00 PM': 'no',
    '11:30 PM': 'no',
};

// full array of timeslot options
export const startTimeOptions = Object.keys(defaultSingleDayAvailability)

// For testing and seed data usage
// returns an availability object for a single day
const generateRandomSingleDayAvailability = () => {
    const availability = {}
    Object.keys(defaultSingleDayAvailability).forEach((timeslot) => {
        availability[timeslot] = ["yes", "no"][Math.floor(Math.random() * 2)]
    })
    return availability
};

// Samples users for testing and demo:
const users = ['becca', 'logan', 'tommy', 'clara', 'charles'].map((user) => {
    return {
        id: user,
        availability: generateRandomSingleDayAvailability(),
    
}});

// Function for a single day
//
// Takes in an array of member availabilities
// final structure tbd, but this demo accepts a single member availability as
// id -> some identifier of user / member
// availability -> the availability object for a user for a single day
//
// RETURNS -> availability object of all times that any number > 0 of members is available
// ... example:
// {
//      '7:00 AM: ['tommy', 'logan', 'clara'],
//      '12:30 PM': ['tommy'],
//      '5:00 PM': ['becca', 'logan', 'tommy' 'clara'],
// }
//
// NOTE: we may actually want this to return ALL hours possible, even if no member is available (TBD)
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

// const commonAvailability = findCommonAvailability([user1, user2, user3, user4, user5])
const commonAvailability = findCommonAvailability(users)

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

console.log('Checking common availability for 5 team members...')
const bestAvailability = findBestAvailability(commonAvailability, 5)
Object.keys(bestAvailability).forEach(timeslot => {
    console.log(`At ${timeslot}, the following ${bestAvailability[timeslot].length} members are available: ${bestAvailability[timeslot].join(' ')}`)
});

// console.log('Checking common availability for 4 team members...')
// console.log(findBestAvailability(commonAvailability, 4))

// console.log('Checking common availability for 3 team members...')
// console.log(findBestAvailability(commonAvailability, 3))

