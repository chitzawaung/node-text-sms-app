const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const Nexmo = require('nexmo');
const socketio = require('socket.io');

//Init Nexmo
const nexmo = new Nexmo({
    apiKey: '62ba9234',
    apiSecret: 'imElxHFnqT7NTmMd'
}, {debug: true});

//Init app
const app = express();

//Template engine setup
app.set('view engine', 'html');
app.engine('html', ejs.renderFile);

//Public folder setup
app.use(express.static(__dirname + '/public'));

//Body parser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//Index route
app.get('/', (req, res) => {
    res.render('index');
});

//Catch from submit
app.post('/', (req, res) => {
    // res.send(req.body);
    // console.log(req.body);
    const number = req.body.number;
    const text = req.body.text;

    nexmo.message.sendSms(
        '959692286882', number, text, { type: 'unicode' },
        (err, responseData) => {
            if(err) {
                console.log(err);
            } else {
                console.dir(responseData);
                // Get data from response
                const data = {
                    id: responseData.messages[0]['message-id'],
                    number: responseData.messages[0]['to']
                }
                // Emit to client
                io.emit('smsStatus', data);
            }
        }
    );
});

//Define port
const port = 3000;

//Start server
const server = app.listen(port, () => console.log(`Server started on port ${port}`));

//
const io = socketio(server);
io.on('connection', (socket) => {
    console.log('Connect');
    io.on('disconnect', () => {
        console.log('Disconnected');
    })
})
