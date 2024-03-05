import Project from '../models/project.js'
import { findCommonAvailability } from '../utils/availability.js';
import { generateProject, fillProjectWithUsers } from '../utils/helpers/projects.js';

import { 
    sortMembersByRole, 
    setupQueryParams, 
    getNeededMembersByRoleWithMostOverlap, 
    buildNewTeamResponse, 
    findAndSetAStartingMember, 
    filterOutStartingMembersFromCollections, 
    getCollectionsByRole, 
    determineNeededRoles, 
    checkIfStartingMembersAreValid
} from '../utils/helpers/team-matching-helpers.js';


// Open Questions:
// - What follow up logic do we also want to implement after a team is made and assigned to a project?
//    * Schedule their first meeting?
//    * Send out emails?
//    * Set up their group chat / Send out intital bot messaging?


/**
 * 
 * @param {*} req 
 * @param {*} res 
 * 
 *  Currently users are fetched from the database incrementally. 
 *  Follow up requests using count and offset can fetch more users if necessary.
 * 
 *  Users are also retrieved from the database with preference to earlier 'createdAt' value,
 *      to prioritize users who have been waiting longer for a team.
 *      There may be some drawbacks to this approach that we'll have to address, like stale users, etc.
 *      Can circle back to this approach, and add/change handling if needed
 * 
 *  Once a team is found with minimum required overlapping availability for each role,
 *      a project is generated with the users and the project is saved to each user instance
 */
export const generateTeam = async (req, res) => {
    try {
        const query = setupQueryParams(req)
        const { count, offset } = query

        const { startingMembersIds } = req.body;
        let startingMembers = await checkIfStartingMembersAreValid(startingMembersIds);

        const neededRoles = determineNeededRoles(startingMembers);
        let collectionsByRole = await getCollectionsByRole(neededRoles, count, offset)

        if (!startingMembers || startingMembers.length === 0) {
            startingMembers = findAndSetAStartingMember(
                startingMembers, 
                collectionsByRole,
                neededRoles
            )
        } else {
            collectionsByRole = filterOutStartingMembersFromCollections(
                startingMembers, 
                collectionsByRole,
            )
        };

        const { collectionOfSWE, collectionOfUX, collectionOfPM } = collectionsByRole

        const newEngineers = await getNeededMembersByRoleWithMostOverlap(
            neededRoles, 
            startingMembers, 
            collectionOfSWE, 
            'swe', 
            'Software Engineer',
            query
        );

        let finalTeam = [...startingMembers, ...newEngineers]

        const newDesigners = await getNeededMembersByRoleWithMostOverlap(
            neededRoles, 
            finalTeam, 
            collectionOfUX, 
            'ux',
            'UX Designer',
            query
        );

        finalTeam.push(...newDesigners)

        const newProductManagers = await getNeededMembersByRoleWithMostOverlap(
            neededRoles,
            finalTeam,
            collectionOfPM,
            'pm',
            'Product Manager',
            query
        );

        finalTeam.push(...newProductManagers)

        const commonAvailability = findCommonAvailability(finalTeam)
        const project = new Project(await generateProject())

        const { 
            engineers, 
            designers, 
            product
        } = sortMembersByRole(finalTeam)

        await fillProjectWithUsers(project, designers, engineers, product);

        const response = buildNewTeamResponse(commonAvailability, finalTeam, project)

        const daysInCommon = Object.keys(response.commonAvailability).length;

        if (daysInCommon < 3) {
            throw new Error(`Team has ${response.totalCommonHours} overlapping availability each week, but only over${daysInCommon} day(s).`)
        };

        // Note: There is a calendar quota so we'll wait to immplement this with actual users
        // projects[0].calendarId = await addCalendarToProject(projects[0]._id);
        await project.save();

        for (const user of finalTeam) {
            await user.save();
        };

        res.status(201).json(response);
    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: 'Error ocurred while attempting to match a team.',
            error: error.message,
        });
    }
};
