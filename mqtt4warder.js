//const gw = require('mqtt').connect('mqtt://192.168.0.6');
const gw = require('mqtt').connect('mqtt://nms.iptime.org:23');
const broker = require('mqtt').connect('mqtt://nms.iptime.org:8080');

gw.on('connect', () => {
	console.log('connection to the gateway succeed')
	gw.subscribe('lora/+/+');

	broker.on('connect', () => {
		console.log('connection to the broker succeed');
			
		gw.on('message', (topic, payload) => {
			broker.publish(topic, String(payload));
		});
	});
});

