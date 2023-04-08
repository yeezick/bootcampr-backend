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
export const defaultProject = {
    title: 'Travel Troubles',
    goal: 'Design & ship a responsive website. UXD: High-fidelity prototype to hand off to developers. SWE: Deployed full-stack website.',
    problem: 'How might we connect people with similar travel plans/interests? Consider solo travelers, commuters, road-trippers, etc. who might have common pain points while traveling.',
    startDate: Date.now(),
    duration: 28,
}