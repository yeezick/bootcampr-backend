
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