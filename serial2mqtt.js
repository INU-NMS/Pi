const s = require('serialport')
const mqtt = require('mqtt').connect('mqtt://nms.iptime.org:23')
const util = require('util');

const serial = new s('/dev/ttyACM0', { baudRate: 115200 })
const parser = new s.parsers.Readline({ delimiter: '\n' })

var _eui;
var _topic;

var is_rcnt = false;

serial.on('open', () => {
	console.log('serial2mqtt now running')
	serial.pipe(parser)

	mqtt.on('connect', () => {
		if(is_rcnt) {
			console.log('reconnected to the mqtt server');
			return;
		} else {
			is_rcnt = true;
			console.log('connected to the mqtt server');
			mqtt.subscribe('node/#')
		}

		parser.on('data', (data) => {
			console.log('[serial]: ', String(data))
			if(data.includes('TX DONE')) mqtt.publish(_topic, 'TX DONE');
			if(data.includes('0080')) {
				_eui = data.replace(/(.{2})/g, "$1-").slice(0, -2);
				_topic = util.format('node/%s/res', _eui);
				mqtt.publish('node/all/res', _eui);
			}
			if(data.includes('status')) {
				mqtt.publish(_topic, data);
			}
		})

		mqtt.on('message', (topic, payload) => {
			if(!(topic.includes('all') || topic.includes(_eui))) return;
			if(!topic.includes('req')) return;
			console.log('[mqtt]:\t', topic, String(payload));

			if(String(payload) === 'reset') {
				serial.set({ brk: true })
				serial.set({ brk: false })
			}

			serial.write(util.format('%s\r\n', String(payload)));
		})
	})
})
