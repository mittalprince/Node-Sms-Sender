require('dotenv').config()
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const Nexmo = require('nexmo');
const socketio = require('socket.io');

const nexmo = new Nexmo({
    apiKey: process.env.clientId,
    apiSecret: process.env.clientSecret
}, {debug: true});

const app = express();

app.set('view engine', 'ejs');

app.use(express.static(__dirname + '/public'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.render('index');
});

app.post('/', (req, res) => {
    // res.send(req.body);
    // console.log(req.body);
    const number = req.body.number;
    const text = req.body.text;

    nexmo.message.sendSms(
        'NEXMO', number, text, { type: 'unicode' },
        (err, responseData) => {
            if(err) {
                console.log(err);
            } else {
                console.dir(responseData);
                const data = {
                    id: responseData.messages[0]['message-id'],
                    number: responseData.messages[0]['to']
                }

                io.emit('smsStatus', data);
            }
        }
    );
});

const port = process.env.PORT || 8000;

const server = app.listen(port, () => console.log(`Server started on port ${port}`));

const io = socketio(server);
io.on('connection', (socket) => {
    console.log('Connected');
    io.on('disconnect', () => {
        console.log('Disconnected');
    })
})