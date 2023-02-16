const users = []

const addUser = ({username, id, room})=>{
    username = username.trim()
    room = room.trim()

    if (!username || !room){
        return {
            error: 'username and room are required'
        }
    }

    const existingUser = users.find(user=>{
        return user.username === username && user.room === room
    })

    if (existingUser){
        return {
            error: 'username is in use'
        }
    }

    const user = {id, username, room}
    users.push(user)
    return {
        user
    }
}

const removeUser = (id)=>{

    if (!id){
        return {
            error: 'id is required'
        }
    }

    const userIndex = users.findIndex(user=>user.id === id)
    if (userIndex !== -1){
        return users.splice(userIndex, 1)[0] 
    }
}

const getUser = (id)=>{
    return users.find(user=>user.id === id)
}

const getUsersInRoom = (room)=>{
    room = room.trim();
    if(!room){
        return {
            error: 'room is required'
        }
    }

    const usersInRoom = users.filter(user=>user.room === room)
    return usersInRoom
}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}