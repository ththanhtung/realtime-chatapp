const socket = io()
const $msgForm = document.querySelector('#form-msg')
const $msgFormInput = document.querySelector('#message');
const $msgFormButton = document.querySelector('#send');
const $sendLocationButton = document.querySelector('#send-location');
const $msgContainer = document.querySelector('.messages-container');

const messageTemplate = document.querySelector('#message-template').innerHTML;
const locationTemplate = document.querySelector('#location-template').innerHTML;


socket.on('msg', (msg) => {
    console.log(msg);
    const html = Mustache.render(messageTemplate, {
        message: msg
    })
    $msgContainer.insertAdjacentHTML('beforeend', html)
});

socket.on('location-msg', (url)=>{
    const html = Mustache.render(locationTemplate, {
        url
    })
    $msgContainer.insertAdjacentHTML('beforeend', html)
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