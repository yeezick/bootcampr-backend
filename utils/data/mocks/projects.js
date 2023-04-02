  // Create Project Types Info for input - Update as needed
export const projectThemes = {
    charity: {
        title: 'Charity Project',
        goal: 'Complete a Minimum Viable Product',
        problem: 'Your client needs an application that connects members of their community to share resources.'
    },
    travel: {
        title: 'Travel Project',
        goal: 'Complete a Minimum Viable Product',
        problem: 'Your client needs an application that connects travelers with common needs and interests to connect, share advice, and resources.'
    },
    interests: {
        title: 'Common Interests Project',
        goal: 'Complete a Minimum Viable Product',
        problem: 'Your client needs an application that connects people with common interests.'
    }
}

// Can be adapted as needed
const defaultProject = {
    title: 'Project Title',
    goal: 'Project Goal',
    problem: 'Project Problem',
    startDate: Date.now(),
    duration: 28,
}