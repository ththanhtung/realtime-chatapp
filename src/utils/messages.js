const generateMsg = (username,msg)=>({
    username,
    msg,
    createdAt: new Date().getTime()
})

module.exports = {
    generateMsg
}