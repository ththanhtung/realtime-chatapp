const generateMsg = (msg)=>({
    msg,
    createdAt: new Date().getTime()
})

module.exports = {
    generateMsg
}