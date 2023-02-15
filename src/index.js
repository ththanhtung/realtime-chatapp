const express = require('express')
const path = require('path')
const http = require('http')
const socketio = require('socket.io')
const Filter = require('bad-words') 

const app = express()
const port = process.env.PORT || 3000
const publicDirPath = path.join(__dirname, '../public')
 
const server = http.createServer(app)
const io = socketio(server)

app.use(express.json())
app.use(express.static(publicDirPath))

io.on('connection', (socket)=>{
    console.log('new websocket connection');
    socket.emit('msg', 'welcome!')
    socket.broadcast.emit('msg','a new user has joined')

    socket.on('new-message', (msg, callback)=>{
        const filter = new Filter()

        if(filter.isProfane(msg)){
            return callback('profanity is not allowed')
        }

        io.emit('msg', msg)
        callback()
    })

    socket.on('disconnect', ()=>{
        io.emit('msg', 'a user has left')
    })

    socket.on('send-location', (position, callback)=>{
        io.emit('location-msg', `http://google.com/maps?q=${position.lat},${position.lng}`);
        callback()
    })
})

server.listen(port, ()=>{
    console.log(`server is up on port ${port}`); 
})