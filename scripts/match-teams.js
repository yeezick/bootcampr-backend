import { generateTeam } from "../controllers/temp-team-matching.js"
import { matchATeam } from "../utils/team-matching.js"

console.log('Finding the perfect match...')


const users = [
{
    "availability": {
        "SUN": {
            "available": true,
            "availability": [
                [
                    "12:00 PM",
                    "5:30 PM"
                ]
            ]
        },
        "MON": {
            "available": true,
            "availability": [
                [
                    "9:00 AM",
                    "5:00 PM"
                ]
            ]
        },
        "TUE": {
            "available": true,
            "availability": [
                [
                    "5:30 PM",
                    "9:00 PM"
                ]
            ]
        },
        "WED": {
            "available": true,
            "availability": [
                [
                    "5:30 PM",
                    "9:00 PM"
                ]
            ]
        },
        "THU": {
            "available": true,
            "availability": [
                [
                    "7:00 AM",
                    "9:30 AM"
                ]
            ]
        },
        "FRI": {
            "available": true,
            "availability": [
                [
                    "9:00 AM",
                    "10:30 PM"
                ]
            ]
        },
        "SAT": {
            "available": true,
            "availability": [
                [
                    "12:00 PM",
                    "5:30 PM"
                ]
            ]
        }
    },
    "links": {
        "githubUrl": "www.github.com/Misael-Walter",
        "linkedinUrl": "www.linkedin.com/Misael-Walter",
        "portfolioUrl": "www.MisaelWalter.com"
    },
    "_id": "65c40e284580112f93847da4",
    "bio": "I'm a miniature UX Designer. I'm an avid pick lover and I'm passionate about anesthesiologys. I'm far-off, grouchy, and unsteady and look forward to using my skills to build something average. Let's get immense!",
    "email": "Misael.Walter@hotmail.com",
    "emailPreferences": {
        "bootcamprUpdates": true,
        "newsletters": true,
        "projectUpdates": true,
        "eventInvitations": true,
        "surveysAndFeedback": true,
        "chatNotifications": true,
        "jobAlerts": true
    },
    "firstName": "Misael",
    "lastName": "Walter",
    "onboarded": false,
    "profilePicture": "https://loremflickr.com/640/480/people?lock=90340",
    "defaultProfilePicture": "",
    "hasProfilePicture": true,
    "project": "65c40e4e4580112f93847e9d",
    "role": "UX Designer",
    "timezone": "-8:00",
    "unreadMessages": {},
    "verified": true,
    "createdAt": "2024-02-07T23:12:39.184Z",
    "updatedAt": "2024-02-07T23:12:39.184Z",
    "__v": 0
}]

generateTeam()

matchATeam()


