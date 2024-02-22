import User from '../../models/user.js'
import { findCommonAvailability, convertUserFriendlyTimeSlotToLogical } from '../availability.js';

const sweRequired = 3;
const uxRequired = 2;
const pmRequired = 1;

const minumumDaysOverlapRequired = 3;
const minimumHoursOverlapRequired = 8;

/**
 * 
 * @param {*} finalTeamUserObjects - array of User objects
 * @returns object with arrays of team members organized by role
 */
export const sortMembersByRole = (finalTeamUserObjects) => {
    const designers = finalTeamUserObjects.filter((member) => member.role === 'UX Designer')
    const engineers = finalTeamUserObjects.filter((member) => member.role === 'Software Engineer')
    const product = finalTeamUserObjects.filter((member) => member.role === 'Product Manager')

    return {
        designers,
        engineers,
        product
    }
};

export const setupQueryParams = (req) => {
    const count = Number(req.query.count) || 50;
    const offset = Number(req.query.offset) || 0;

    return {
        count,
        offset,
        nextOffset: count + offset,
    }
};

export const getNeededMembersByRoleWithMostOverlap = async (neededRoles, startingMembers, collection, roleNickName, role, query) => {
    const { count, offset, nextOffset } = query;

    const meetsMinOverlap = neededRoles[roleNickName] > 0
        ? meetMinimumOverlappingHours(startingMembers, collection)
            .sort((a,b) => b.commonHours - a.commonHours)
        : []

    if (meetsMinOverlap.length < neededRoles[roleNickName]) {
        const totalAvailableByRole = await User.count({role, project: null})

        if (totalAvailableByRole < nextOffset) {
            throw new Error(`No more ${role}s with minimum overlapping availability left in database to match.`)
        };
        
        throw new Error(`None of set (count: ${count}, offset: ${offset}) of ${role}s matches minumum availability. Try again with offset: ${nextOffset}`)
    }

    const userObjects = meetsMinOverlap.map((user) => user.user)

    return userObjects.slice(0, neededRoles[roleNickName])
};

export const buildNewTeamResponse = (commonAvailability, finalTeamUserObjects, project) => {
    const totalCommonHours = getTeamCommonHoursTotal(commonAvailability)
    const team = finalTeamUserObjects.map((member) => {
        return {
            member: `${member.firstName} ${member.lastName}`,
            role: member.role,
            id: member._id
        }
    })

    return {
        project: {
            id: project._id,
            startDate: project.timeline.startDate,
            endDate: project.timeline.endDate,
        },
        team,
        totalCommonHours,
        commonAvailability
    }
}

export const findAndSetAStartingMember = (
    startingMembers, 
    collectionsByRole,
    neededRoles
) => {
    const { collectionOfSWE, collectionOfUX, collectionOfPM } = collectionsByRole

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
        .select('firstName lastName availability role project _id')
};

export const filterOutStartingMembersFromCollections = (
    startingMembers, 
    collectionsByRole
) => {
    let { collectionOfSWE, collectionOfUX, collectionOfPM } = collectionsByRole
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

    return {
        collectionOfSWE,
        collectionOfUX,
        collectionOfPM
    }
};

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
        pm: [],
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
                members.pm.push(member)
                break;
            default:
                console.log('Unexpected role provided')
        }
    })

    const neededRoles = {
        swe: sweRequired - members.swe.length,
        ux: uxRequired - members.ux.length,
        pm: pmRequired - members.pm.length
    };

    let errorMessage;
    if (neededRoles.swe < 0) {
        errorMessage = `Only ${sweRequired} Software Engineers are allowed per team.`
    } else if (neededRoles.ux < 0) {
        errorMessage = `Only ${uxRequired} UX Designers are allowed per team.`
    } else if (neededRoles.pm < 0) {
        errorMessage = `Only ${pmRequired} Product Managers are allowed per team.`
    };

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
};

export const meetMinimumOverlappingHours = (existingMembers, users) => {
    const meetsMinimum = [];

    users.forEach((user) => {
        const commonAvailability = findCommonAvailability([...existingMembers, user])

        const totalHoursOverlap = Object.keys(commonAvailability).map((day) => {
            const logical = convertUserFriendlyTimeSlotToLogical(...commonAvailability[day][0])

            return logical.length
        })

        const sum = totalHoursOverlap.reduce((a, b) => a + b, 0)
        
        const totalDaysCommon = Object.keys(commonAvailability).length
        if (sum / 2 > minimumHoursOverlapRequired && totalDaysCommon >= minumumDaysOverlapRequired) {
            meetsMinimum.push({
                commonHours: sum/2,
                name: `${user.firstName} ${user.lastName}`,
                _id: user._id,
                availability: user.availability,
                role: user.role,
                user,
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

export const getTotalProductCount = async () => {
    return await User.count({role: 'Product Manager'})
}