import { randomIndex } from './seed/utils/helpers.js'

/**
 * Uses realistic time slot options to generate random availability for a single day
 */
export const generateRealisticSingleDayAvailability = () => {
    let availability = [];
    const randomSlot = commonAvailableTimeslots[randomIndex(commonAvailableTimeslots.length)]
    availability.push(randomSlot)

    return availability
}

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


/**
 * TODO: Find Common Availability for a Set of Team Members for a Single Day
 */