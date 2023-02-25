import mongoose from 'mongoose';
const Schema = mongoose.Schema;

// replace old User with this as User when finished.
const NewUser = new Schema(
    {
        bio: { type: String, maxlength: 300 },
        email: {
            match: /.+\@.+\..+/,
            type: String,
            required: true,
            unique: [ true, 'E-mail already exists.'],
        },
        firstName: { type: String, required: true },
        githubUrl: { type: String },
        lastName: { type: String, required: true },
        linkedinUrl: { type: String },
        passwordDigest: { type: String, required: true, select: false },
        portfolioProjects: [{ type: Object }],
        portfolioUrl: { type: String },
        profilePicture: { type: String },
        role: { type: String, enum: ['Software Engineer', 'UX Designer'] },
        projectInfo: {
            // can null be an option here until the user is assigned a project?
            id: null || { type: Schema.Types.ObjectId, ref: 'Project'},
            // Decide how to handle the project choices
            choicePreference: { type: String }
        },
        // for below see Evernote / Erick's notes + mine
        // verified
        // availability
        // availability: { 
        //     0: [null, '12:00 AM']
        //     1: [null, '1:00am']
        // }
        // chats
        // meetings
        // timezone?
    },
    { timestamps: true},
);