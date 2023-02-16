const express = require('express')
const path = require('path')
const http = require('http')
const socketio = require('socket.io')
const Filter = require('bad-words') 
const { generateMsg } = require('./utils/messages')
const { addUser, removeUser, getUser, getUsersInRoom } = require('./utils/users')

const app = express()
const port = process.env.PORT || 3000
const publicDirPath = path.join(__dirname, '../public')
 
const server = http.createServer(app)
const io = socketio(server)

app.use(express.json())
app.use(express.static(publicDirPath))

io.on('connection', (socket)=>{
    console.log('new websocket connection');
    
    socket.on('join', ({username, room}, callback)=>{
        const {error, user} = addUser({id: socket.id, username, room})

        if (error){
            return callback(error)
        }

        socket.join(user.room) 
        socket.emit('msg', generateMsg('System Admin', 'Welcome!'));
        socket.broadcast
          .to(user.room)
          .emit(
            'msg',
            generateMsg('System Admin', `${user.username} has joined`)
          );

        io.to(user.room).emit('room-data', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })
         
        callback()
    })

    socket.on('new-message', (msg, callback)=>{
        const filter = new Filter()

        const user = getUser(socket.id)

        if(filter.isProfane(msg)){
            return callback('profanity is not allowed')
        }

        io.to(user.room).emit('msg', generateMsg(user.username,msg))
        callback()
    })

    socket.on('disconnect', ()=>{
        const user = removeUser(socket.id)
        if (user){
            io.to(user.room).emit(
              'msg',
              generateMsg('System Admin', `${user.username} has left`)
            );
            io.to(user.room).emit('room-data', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }
    })

    socket.on('send-location', (position, callback)=>{
        const user = getUser(socket.id)
        io.to(user.room).emit(
          'location-msg',
          generateMsg(
            user.username,
            `http://google.com/maps?q=${position.lat},${position.lng}`
          )
        );
        callback()
    })
})

server.listen(port, ()=>{
    console.log(`server is up on port ${port}`); 
})