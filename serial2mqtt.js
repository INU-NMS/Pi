const DEV_PORT = '/dev/ttyACM0';
const BROKER_ADDR = 'nms.iptime.org:23';

const udev = require('udev');
const s = require('serialport');
const mqtt = require('mqtt').connect(`mqtt://${BROKER_ADDR}`);

var eui;
var isOpened = false;
var isConnedted = false;
var monitor = udev.monitor();

const port = new s(DEV_PORT, { baudRate: 115200 }, HandlePortError);
const parser = new s.parsers.Readline({ delimiter: '\n' })

port.on('open', () => {
	console.log(`[port]\topen ${DEV_PORT}`);
	isOpened = true;
	port.pipe(parser);
})

mqtt.on('connect', () => {
	console.log(`[mqtt]\tconnected ${BROKER_ADDR}`);
	isConnedted = true;
	mqtt.subscribe('node/#');
})

mqtt.on('close', () => {
	console.log(`[mqtt]\tdisconnected`);
	isConnedted = false;
})

parser.on('data', (data) => {
	if(isConnedted == false) return;

	console.log('[port]\t', String(data));
	if(data.includes('0080')) {
		eui = data.replace(/(.{2})/g, "$1-").slice(0, -2);
		mqtt.publish('node/all/res', _eui);
	}
	if(data.includes('status')) mqtt.publish(`node/${eui}/res`, data);
	if(data.includes('TX DONE')) mqtt.publish(_topic, 'TX DONE');
})

mqtt.on('message', (topic, payload) => {
	if(isOpened == false) {
		console.log(`[mqtt]\t port is not opened, ignore ${topic}`);
		return;
	}

	var isReqTopic = (topic.includes('all') || topic.includes(eui)) && topic.includes('req');
	if(isReqTopic == false) return;

	console.log('[mqtt]\t', topic, String(payload));
	if(String(payload) === 'reset') {
		port.set({ brk: true })
		port.set({ brk: false })
	}
	port.write(`${String(payload)}\r\n`);
})


monitor.on('add', (dev) => { 
	console.log(dev);
	if(dev === DEV_PORT) port.open(HandlePortError); 
});
monitor.on('remove', (dev) => { if(dev === DEV_ADDR) console.log(`[port]\tremoved ${DEV_ADDR}`); });

function HandlePortError(err) {
	console.log(`[port]\t${err.message}`);
	isOpened = false;
	console.log(`[port]\twaiting for connection${DEV_PORT}`);
}

