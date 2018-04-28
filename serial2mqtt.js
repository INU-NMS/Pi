const DEV_PORT = '/dev/ttyACM0';
const BROKER_ADDR = 'nms.iptime.org:23';

const s = require('serialport');
const mqtt = require('mqtt').connect(`mqtt://${BROKER_ADDR}`);

var eui;
var isOpened = false;
var isConnedted = false;

const port = new s(DEV_PORT, { baudRate: 115200 });
const parser = new s.parsers.Readline({ delimiter: '\n' })

port.on('open', () => {
	console.log(`port open: ${DEV_PORT}`);
	isOpened = true;
	port.pipe(parser);
})

port.on('error', (err) => {
	console.log(`port error: ${err}`);
	isOpened = false;
	// handling 필요
})

mqtt.on('connect', () => {
	console.log(`mqtt connected: ${BROKER_ADDR}`);
	isConnedted = true;
	mqtt.subscribe('node/#');
})

mqtt.on('close', () => {
	console.log(`mqtt disconnected`);
	isConnedted = false;
})

parser.on('data', (data) => {
	if(isConnedted == false) return;

	console.log('[port]:\t', String(data));
	if(data.includes('0080')) {
		eui = data.replace(/(.{2})/g, "$1-").slice(0, -2);
		mqtt.publish('node/all/res', _eui);
	}
	if(data.includes('status')) mqtt.publish(`node/${eui}/res`, data);
	if(data.includes('TX DONE')) mqtt.publish(_topic, 'TX DONE');
})

mqtt.on('message', (topic, payload) => {
	if(isOpened == false) return;

	var isReqTopic = (topic.includes('all') || topic.includes(eui)) && topic.includes('req');
	if(isReqTopic == false) return;

	console.log('[mqtt]:\t', topic, String(payload));
	if(String(payload) === 'reset') {
		port.set({ brk: true })
		port.set({ brk: false })
	}
	port.write(`${String(payload)}\r\n`);
})
