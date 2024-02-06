import User from "../../models/user"

const cleanupUserData=async()=>{
    await User.deleteMany()
}

export default cleanupUserData;