import User from '../models/user.js';
import Project from '../models/project.js'
import { convertUserFriendlyTimeSlotToLogical, findCommonAvailability } from '../utils/availability.js';
import { generateProject } from '../utils/seed/utils/projects.js';
import { fillProjectWithUsers } from '../utils/seed/utils/projects.js';

const sweRequired = 3;
const uxRequired = 2;
const productRequired = 0; // Update when we implement 'Product Manager' role

const minumumDaysOverlapRequired = 3;
const minimumHoursOverlapRequired = 8;

// Open Questions:
// - Should we prioritize "first in line" and sort by createdAt?
// - What follow up logic do we also want to implement after a team is made and assigned to a project?
//    * Schedule their first meeting?
//    * Send out emails?


// TODO:
// - Similarly, if the whole DB was exhausted and no team was found, return an appropriate error
// - Cleanly and smartly abstract logic blocks into helper functions with very clear names and definitions
// - Set up to handle product managers as well
// - Export util functions to external file
// - Pass the full user object in the meets minimum (with commonHours) so we don't need to call the DB again
// - Only return useful info from large DB calls (fetch 50 swe/ux) (availability, role, id, project)
// - Try populate and troubleshoot if its still not working
// - Consider automating the followup 50?
// - Make this work when Product Manager = 0, or 1
// - Make all of the repeated role work reusable
// - Sometimes 'available' is true and availability is null... - fix
// - consider using separate offsets for each role?
// - troubleshoot why some teams have lesss than 3 days in common

export const generateTeam = async (req, res) => {
    try {
        const count = Number(req.query.count) || 50;
        const offset = Number(req.query.offset) || 0;
        const newOffset = count + offset
        const query = { count, offset, newOffset }

        const { startingMembersIds } = req.body;

        let startingMembers = await checkIfStartingMembersAreValid(startingMembersIds);
        const neededRoles = determineNeededRoles(startingMembers);

        let {
            collectionOfSWE, 
            collectionOfUX,
            collectionOfPM 
        } = await getCollectionsByRole(neededRoles, count, offset)

        if (!startingMembers || startingMembers.length === 0) {
            startingMembers = findAndSetAStartingMember(
                startingMembers, 
                collectionOfSWE, 
                collectionOfUX, 
                collectionOfPM, 
                neededRoles
            )
        } else {
            filterOutStartingMembersFromCollections(
                startingMembers, 
                collectionOfSWE, 
                collectionOfUX, 
                collectionOfPM
            )
        };

        // TODO: Test when too many swes are given and when no more swe match min
        const newEngineers = getNeededMembersByRoleWithMostOverlap(neededRoles, startingMembers, collectionOfSWE, 'swe', query)
        let finalTeam = [...startingMembers, ...newEngineers]

        const newDesigners = getNeededMembersByRoleWithMostOverlap(neededRoles, finalTeam, collectionOfUX, 'ux', query)
        finalTeam.push(...newDesigners)

        // condense?
        const finalTeamUserIds = finalTeam.map((member) => member._id)
        const finalTeamUserObjects = await User.find({"_id": {"$in": finalTeamUserIds}})

        const commonAvailability = findCommonAvailability(finalTeamUserObjects)

        const project = new Project(await generateProject())

        const dbDesigners = finalTeamUserObjects.filter((member) => member.role === 'UX Designer')
        const dbEngineers = finalTeamUserObjects.filter((member) => member.role === 'Software Engineer')

        await fillProjectWithUsers(project, dbDesigners, dbEngineers);

        // Note: There is a cost per calendar so we'll wait to immplement this with actual users
        // projects[0].calendarId = await addCalendarToProject(projects[0]._id);
        await project.save();

        for (const user of finalTeamUserObjects) {
            await user.save();
        };

        const response = buildNewTeamResponse(commonAvailability, finalTeamUserObjects)

        res.status(200).json(response);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            // Update this messaging
            message: 'Error occurred while fetching users.',
            error: error.message,
        });
    }
};

export const getNeededMembersByRoleWithMostOverlap = (neededRoles, startingMembers, collection, roleNickName, query) => {
    const { count, offset, newOffset } = query;

    const meetsMinOverlap = neededRoles[roleNickName] > 0
        ? meetMinimumOverlappingHours(startingMembers, collection)
            .sort((a,b) => b.commonHours - a.commonHours)
        : []

    if (meetsMinOverlap.length < neededRoles[roleNickName]) {
        throw new Error(`None of set (count: ${count}, offset: ${offset}) of Software Engineers matches minumum availability. Try again with offset: ${newOffset}`)
    }

    return meetsMinOverlap.slice(0, neededRoles[roleNickName])
}

// TODO: Determine if this is the best response
// Also is 201 appropriate? If not, whats the best response code?
export const buildNewTeamResponse = (commonAvailability, finalTeamUserObjects) => {
    const totalCommonHours = getTeamCommonHoursTotal(commonAvailability)
    const team = finalTeamUserObjects.map((member) => `${member.firstName} ${member.lastName}: ${member.role}`)

    return {
        team,
        totalCommonHours,
        commonAvailability
    }
}

export const findAndSetAStartingMember = (startingMembers, collectionOfSWE, collectionOfUX, collectionOfPM, neededRoles) => {
    if (collectionOfSWE) {
        startingMembers = [collectionOfSWE.shift()]
        neededRoles.swe -= 1
    } else if (collectionOfUX) {
        startingMembers = [collectionOfUX.shift()]
        neededRoles.ux -= 1
    } else if (collectionOfPM) {
        startingMembers = [collectionOfPM.shift()]
        neededRoles.product -= 1
    } else {
        throw new Error('There was an issue creating a new team. Please try again.')
    }

    return startingMembers;
}

export const fetchUnassignedUsersByRole = async (role, count = 50, offset = 0) => {
    return await User
        .find({role, project: null})
        .sort({"createdAt": 1})
        .skip(offset)
        .limit(count)
};

export const filterOutStartingMembersFromCollections = (
    startingMembers, 
    collectionOfSWE, 
    collectionOfUX, 
    collectionOfPM
) => {
    startingMembers.forEach((member) => {
        switch (member.role) {
            case 'Software Engineer':
                collectionOfSWE = collectionOfSWE
                    .filter((user) => String(user._id) !== String(member._id)
                )
                break;
            case 'UX Designer':
                collectionOfUX = collectionOfUX
                    .filter((user) => String(user._id) !== String(member._id))
                break;
            case 'Product Manager':
                collectionOfPM = collectionOfPM
                    .filter((user) => String(user._id) !== String(member._id))
                break;
        }
    })
}

export const getCollectionsByRole = async (neededRoles, count, offset) => {

    const swe = neededRoles.swe > 0 && await fetchUnassignedUsersByRole('Software Engineer', count, offset)
    const ux = neededRoles.ux > 0 && await fetchUnassignedUsersByRole('UX Designer', count, offset)
    const pm = neededRoles.pm > 0 && await fetchUnassignedUsersByRole('Product Manager', count, offset)

    return {
        collectionOfSWE: swe,
        collectionOfUX: ux,
        collectionOfPM: pm,
    }
};

export const getTeamCommonHoursTotal = (commonAvailability) => {
    const hoursPerDayOverlap = Object.keys(commonAvailability).map((day) => {
            return convertUserFriendlyTimeSlotToLogical(...commonAvailability[day][0]).length
        });

    const hoursPerWeekOverlap = hoursPerDayOverlap.reduce((a,b) => a + b, 0)

    return hoursPerWeekOverlap
};

export const determineNeededRoles = (startingMembers) => {

    const members = {
        swe: [],
        ux: [],
        product: [],
    };

    startingMembers && startingMembers.forEach((member) => {
        if (member.project) {
            throw new Error(`User ${member._id} is already assigned to project ${member.project}`)
        };

        switch (member.role) {
            case 'Software Engineer':
                members.swe.push(member)
                break;
            case 'UX Designer':
                members.ux.push(member)
                break;
            case 'Product Manager':
                members.product.push(member)
                break;
            default:
                console.log('Unexpected role provided')
        }
    })

    const neededRoles = {
        swe: sweRequired - members.swe.length,
        ux: uxRequired - members.ux.length,
        product: productRequired - members.product.length
    };

    let errorMessage;
    if (neededRoles.swe < 0) {
        errorMessage = `Only ${sweRequired} Software Engineers are allowed per team.`
    } else if (neededRoles.ux < 0) {
        errorMessage = `Only ${uxRequired} UX Designers are allowed per team.`
    } else if (neededRoles.product < 0) {
        errorMessage = `Only ${productRequired} Product Managers are allowed per team.`
    };

    // TODO: update the error and message field (and status code) of this error
    if (errorMessage) { throw new Error(errorMessage) }

    return neededRoles
};

/**
 *  Checks that each user:
 *      1. exists in database
 *      2. is not already assigned a project
 * @param {*} memberIds - an array of valid user ids
 */
export const checkIfStartingMembersAreValid = async (memberIds) => {
    const startingMembers = await User.find({"_id": {"$in": memberIds}})

    startingMembers.forEach((member) => {
        if (member.project) {
            return new Error(`User ${member._id} is already assigned to preojct ${member.project}`)
        }
    })

    return startingMembers
}

export const meetMinimumOverlappingHours = (existingMembers, users) => {
    const meetsMinimum = [];

    users.forEach((user) => {
        const commonAvailability = findCommonAvailability([...existingMembers, user])

        // Make function to get total hours of common availabilty
        const totalHoursOverlap = Object.keys(commonAvailability).map((day) => {
            const logical = convertUserFriendlyTimeSlotToLogical(...commonAvailability[day][0])

            return logical.length
        })

        const sum = totalHoursOverlap.reduce((a, b) => a + b, 0)
        
        const totalDaysCommon = Object.keys(commonAvailability).length
        if (sum / 2 > minimumHoursOverlapRequired && totalDaysCommon >= minumumDaysOverlapRequired) {
            console.log(totalDaysCommon)
            // TODO: is this object shape the best?
            meetsMinimum.push({
                commonHours: sum/2,
                name: `${user.firstName} ${user.lastName}`,
                _id: user._id,
                availability: user.availability,
                role: user.role
            })
        }
    });

    return meetsMinimum
};

export const getTotalEngineerCount = async () => {
    return await User.count({role: 'Software Engineer'})
};

export const getTotalDesignerCount = async () => {
    return await User.count({role: 'UX Designer'})
};