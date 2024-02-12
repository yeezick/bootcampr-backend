import mongoose from 'mongoose';
import { findCommonAvailability } from "./availability.js";
import User from '../models/user.js'

const sweRequired = 3;
const uxRequired = 2;
const productRequired = 1;

export const matchATeam = async (startingMembers) => {
    // If satrting members are provided, check and make sure their roles don't surpass Required per role
    const members = {
        swe: [],
        ux: [],
        product: [],
    };

    startingMembers && startingMembers.forEach((member) => {
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

    console.log(neededRoles)

    if (neededRoles.swe < 0  || neededRoles.ux < 0 || neededRoles.product < 0) {
        console.log('Too many members of a certain role.')
    } else {
        let firstFiftySWE;

        // TODO: only do this if swes are needed
        if (neededRoles.swe > 0) {
            console.log('Fetching first fifty Software Engineers')
            try {
                const firstFiftySWE = await User
                .find({role: 'Software Engineer', project: null})
                .sort({"createdAt": 1})
                .limit(5)
            console.log(firstFiftySWE)
            } catch (err) {
                console.error(err)
            }

        }
        console.log(firstFiftySWE)

        // TODO: Test if this can just check startingMembers
        // If no starting members were provided, start with the first SWE
        if (!startingMembers || startingMembers.length === 0) {
            console.log('Starting with the first SWE')
            startingMembers = firstFiftySWE.shift()
            console.log(startingMembers)
        } else {
            const existingTeamCommonAvailability = findCommonAvailability(startingMembers)
            console.log(existingTeamCommonAvailability)
        }
        
    }






    // // Find first 50 Software Engineers without a project, in order of account creation
   

    // // Start the team with the first SWE without a project
    // const firstSWE = firstFiftySWE.shift()

    // // Get the first fifty UX Designers without a project, in order of account creation
    // const firstFiftyUX = await User
    //     .find({role: 'UX Designer', project: null})
    //     .sort({"createdAt": 1})
    //     .limit(50)

    // const meetsMinOverlap = {UX: [], SWE: []}

    // const meetMinimumOverlappingHours = (existingMembers, users) => {
    //     const meetsMinimum = [];

    //     users.forEach((user) => {
    //         const commonAvailability = findCommonAvailability([...existingMembers, user])

    //         // Make function to get total hours of common availabilty
    //         const totalHoursOverlap = Object.keys(commonAvailability).map((day) => {
    //             const logical = convertUserFriendlyTimeSlotToLogical(...commonAvailability[day][0])

    //             return logical.length
    //         })

    //         const sum = totalHoursOverlap.reduce((a, b) => a + b, 0)

    //         const minimumHoursOverlapForATeam = 15;
            
    //         // Potential teammates must have a minimum of 15 hours overlap
    //         // TODO: Ask team what we think the minimum should be 
    //         if (sum / 2 > minimumHoursOverlapForATeam) {
    //             // TODO: is this object shape the best?
    //             meetsMinimum.push({
    //                 commonHours: sum/2,
    //                 name: `${user.firstName} ${user.lastName}`,
    //                 _id: user._id,
    //                 availability: user.availability,
    //                 role: user.role
    //             })
    //         }
    //     });

    //     return meetsMinimum
    // }

    // // Store and sort all SWEs that meet minimum
    // meetsMinOverlap.UX = meetMinimumOverlappingHours([firstSWE], firstFiftyUX)
    // meetsMinOverlap.UX.sort((a,b) => b.commonHours - a.commonHours)

    // // Store and sort all UXers that meet minimum
    // meetsMinOverlap.SWE = meetMinimumOverlappingHours([firstSWE], firstFiftySWE)
    // meetsMinOverlap.SWE.sort((a,b) => b.commonHours - a.commonHours)

    // // Grab the 2 designers with highest overlapping hours
    // const designers = meetsMinOverlap.UX.slice(0,2)
    // // Grab the 2 engineers with highest overlapping hours
    // const engineers = meetsMinOverlap.SWE.slice(0,2)

    // // Assemble team
    // const team = [...designers, ...engineers, firstSWE]
    // const dbTeam = team.map((member) => member._id)
    // const testDBteam = await User.find({ "_id": { "$in": dbTeam}})

    // const commonAvailability = findCommonAvailability(team)

    // // Create a project for the new team
    // const project = new Project(await generateProject())

    // const dbDesigners = testDBteam.filter((member) => member.role === 'UX Designer')
    // const dbEngineers = testDBteam.filter((member) => member.role === 'Software Engineer')

    // // Fill project with team members 
    // await fillProjectWithUsers(project, dbDesigners, dbEngineers);

    // // Note: There is a cost per calendar so we'll wait to immplement this with actual users
    // // projects[0].calendarId = await addCalendarToProject(projects[0]._id);
    
    // await project.save();

    // for (const user of [...dbDesigners, ...dbEngineers, firstSWE]) {
    //     await user.save();
    // };

    // // TODO: only return necessary info (role?, availability, user id?)
    // // const totalEngineerCount = await User.count({role: 'Software Engineer'})
    // // const totalDesignercount = await User.count({role: 'UX Designer'})
    // // console.log(`Engineers: ${totalEngineerCount}, Designers: ${totalDesignercount}`)
    // // TODO: figure out why the populate portion isn't working
    // // IF minimum is not met for at least the needed amount of given role, fetch more users and continue
    // // Get another 50 engineers, still unassigned to project
    // // const nextFiftyEngineers = await User.find({role: 'Software Engineer', project: null }).skip(50).limit(50)
    // // TODO: user helper functions for the logic heavy chunks

    // const totalHoursOverlap = Object.keys(commonAvailability).map((day) => {
    //     const logical = convertUserFriendlyTimeSlotToLogical(...commonAvailability[day][0])

    //     return logical.length
    // })

    // const sum = totalHoursOverlap.reduce((a, b) => a + b, 0)

    // const response = {
    //     team: [dbDesigners[0].firstName, dbDesigners[1].firstName, dbEngineers[0].firstName, dbEngineers[1].firstName, dbEngineers[2].firstName],
    //     totalCommonHours: sum,
    //     commonAvailability,
    // }
}


// matchATeam(users)


const users = [
    {
        "availability": {
            "SUN": {
                "available": true,
                "availability": [
                    [
                        "8:00 PM",
                        "10:30 PM"
                    ]
                ]
            },
            "MON": {
                "available": true,
                "availability": [
                    [
                        "7:00 AM",
                        "9:30 AM"
                    ]
                ]
            },
            "TUE": {
                "available": true,
                "availability": [
                    null
                ]
            },
            "WED": {
                "available": true,
                "availability": [
                    [
                        "12:00 PM",
                        "5:30 PM"
                    ]
                ]
            },
            "THU": {
                "available": true,
                "availability": [
                    [
                        "12:00 PM",
                        "5:30 PM"
                    ]
                ]
            },
            "FRI": {
                "available": true,
                "availability": [
                    [
                        "9:00 AM",
                        "9:00 PM"
                    ]
                ]
            },
            "SAT": {
                "available": true,
                "availability": [
                    [
                        "5:00 PM",
                        "11:00 PM"
                    ]
                ]
            }
        },
        "links": {
            "githubUrl": "www.github.com/Casimer-Ankunding",
            "linkedinUrl": "www.linkedin.com/Casimer-Ankunding",
            "portfolioUrl": "www.CasimerAnkunding.com"
        },
        "_id": "65c40e284580112f93847da5",
        "bio": "I'm a thankful UX Designer. I'm an avid opinion lover and I'm passionate about pedals. I'm devoted, muddy, and meaty and look forward to using my skills to build something concrete. Let's get capital!",
        "email": "Casimer.Ankunding91@yahoo.com",
        "emailPreferences": {
            "bootcamprUpdates": true,
            "newsletters": true,
            "projectUpdates": true,
            "eventInvitations": true,
            "surveysAndFeedback": true,
            "chatNotifications": true,
            "jobAlerts": true
        },
        "firstName": "Casimer",
        "lastName": "Ankunding",
        "onboarded": false,
        "profilePicture": "https://loremflickr.com/640/480/people?lock=42552",
        "defaultProfilePicture": "",
        "hasProfilePicture": true,
        "project": null,
        "role": "UX Designer",
        "timezone": "-8:00",
        "unreadMessages": {},
        "verified": true,
        "createdAt": "2024-02-07T23:12:39.264Z",
        "updatedAt": "2024-02-07T23:12:39.264Z",
        "__v": 0
    },
]