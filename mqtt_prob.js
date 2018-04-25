const mqtt = require('mqtt').connect('mqtt://192.168.0.7');
var is_rcnt = false;

mqtt.on('connect', ()=> {
    var ex_str = (is_rcnt) ? 're' : '';
    console.log(`${ex_str}connected to the mqtt broker`);

    if(!is_rcnt) {
        console.log('subscribe');
        mqtt.subscribe('hello');
        is_rcnt = true;
    }
});

mqtt.on('message', (topic, payload) => {
    console.log(topic, payload);
});
