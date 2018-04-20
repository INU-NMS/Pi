const s = require('serialport')
const mqtt = require('mqtt').connect('mqtt://nms.iptime.org:8080')
const util = require('util');

const serial = new s('/dev/ttyACM0', { baudRate: 115200 })
const parser = new s.parsers.Readline({ delimiter: '\n' })

var _eui = '00-80-00-00-00-00-eb-38';
var _topic = util.format('node/%s/res', _eui);

serial.on('open', () => {
	console.log('serial2mqtt now running')
	serial.pipe(parser)

	mqtt.on('connect', () => {
		console.log('connected to the mqtt server')
		mqtt.subscribe('node/#')

		parser.on('data', (data) => {
			console.log('[Serial] <<', String(data))
			if(data.includes('TX DONE')) mqtt.publish(_topic, 'TX DONE');
			if(data.includes('0080')) {
				_eui = data.replace(/(.{2})/g, "$1-").slice(0, -2);
				_topic = util.format('node/%s/res', _eui);
				mqtt.publish('node/all/res', _eui);
				mqtt.subscribe(util.format('lora/%s/up', _eui));
			}
			if(data.includes('status')) {
				mqtt.publish(_topic, data);
			}
		})

		mqtt.on('message', (topic, payload) => {
			if(topic.includes('lora')) return;
			console.log(topic, String(payload));

			if(String(payload) === 'reset') {
				serial.set({ brk: true })
				serial.set({ brk: false })
			}

			serial.write(util.format('%s\r\n', String(payload)));
		})
	})
})
