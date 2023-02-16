const socket = io()
const $msgForm = document.querySelector('#form-msg')
const $msgFormInput = document.querySelector('#message');
const $msgFormButton = document.querySelector('#send');
const $sendLocationButton = document.querySelector('#send-location');
const $msgContainer = document.querySelector('.messages-container');

// templates
const messageTemplate = document.querySelector('#message-template').innerHTML;
const locationTemplate = document.querySelector('#location-template').innerHTML;
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML;

// query
const {username, room} = Qs.parse(location.search, {ignoreQueryPrefix: true})

const autoScroll = ()=>{
    // new message element
    const $newMessage = $msgContainer.lastElementChild

    // height of the new message
    const newMessageStyle = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyle.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    // visible height 
    const visibleHeight = $msgContainer.offsetHeight

    // height of the message container 
    const containerHeight = $msgContainer.scrollHeight

    //how far have I scrolled
    const scrollOffset = $msgContainer.scrollTop + visibleHeight

    if (containerHeight - newMessageHeight <= scrollOffset){
        $msgContainer.scrollTop = $msgContainer.scrollHeight
    }
}

socket.on('msg', (msg) => {
    // console.log(msg); 
    const html = Mustache.render(messageTemplate, {
        username: msg.username,
        message: msg.msg,
        createdAt: moment(msg.createdAt).format('hh:mm a')
    })
    $msgContainer.insertAdjacentHTML('beforeend', html)
    autoScroll()
});

socket.on('location-msg', (url)=>{
    const html = Mustache.render(locationTemplate, {
      username: url.username,
      url: url.msg,
      createdAt: moment(url.createdAt).format('hh:mm a'),
    });
    $msgContainer.insertAdjacentHTML('beforeend', html)
    autoScroll()
})

socket.on('room-data', ({room, users})=>{
    const html = Mustache.render(sidebarTemplate, {
        room,
        users 
    })
    const $sidebar = document.querySelector('#sidebar');

    $sidebar.innerHTML = html
})

$msgForm.addEventListener('submit', (e)=>{
    e.preventDefault()
    let msg = e.target.elements.message.value;
    $msgFormButton.setAttribute('disabled', 'disabled')
    socket.emit('new-message', msg, (err)=>{
        $msgFormButton.removeAttribute('disabled');
        $msgFormInput.value=''
        $msgFormInput.focus()
        if (err){
            return console.log(err);
        }
        console.log('message delivered!');
    })
})

$sendLocationButton.addEventListener('click', ()=>{
    if (!navigator.geolocation){
        return alert('geolocation is not supported by you browser')
    }

    $sendLocationButton.setAttribute('disabled', 'disabled');

    navigator.geolocation.getCurrentPosition(position=>{
        socket.emit('send-location', {
            lat: position.coords.latitude,
            lng: position.coords.longitude
        }, ()=>{
           console.log('location shared');
            $sendLocationButton.removeAttribute('disabled')
        })
    })
})

socket.emit('join', {username, room}, (err)=>{
    if (err) {
        alert(err)
        location.href = '/'
    }
})