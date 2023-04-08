import { defaultProject } from '../../data/mocks/projects.js'
import { getIds } from './users.js'
/**
 * Generate Project
 * @param {Object} project custom options including: title, goal, problem, startDate and duration
 * @returns 
 */
export const generateProject = (project = defaultProject) => {
    const { title, goal, problem, startDate, duration } = project
    // TODO: adjust start and end date format and calulcations as needed
    const endDate = Date.now() + duration * 24 * 60 * 60 * 60
    
        return {
        chats: [],
        goal,
        meetings: [],
        members: {
            engineers: [],
            designers: [],
        },
        problem,
        tasks: [],
        timeline: {
            startDate,
            endDate,
        },
        title,
    }
}

/**
 * Fill a project with users
 * @param {Object} project object 
 * @param {Array} designers array of User objects
 * @param {Array} engineers array of User objects
 */
export const fillProjectWithUsers = async (project, designers, engineers) => {
    project.members.engineers = getIds(engineers)
    project.members.designers = getIds(designers)
    const users = [...designers, ...engineers]
    users.forEach(async (user) => {
        user.project = project._id
    })
}