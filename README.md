# Pi
apps for raspberry pi

## udev를 이용하여 Hot Plug 핸들링 구현
* ACM0(mDot 장치) 연결 및 해제 시 이벤트 처리
* 연결 -> 시리얼 포트 개방
* 해제 -> 재연결까지 대기

## udev API (https://github.com/WigWagCo/node-hotplug)
	libudev의 일부 기능을 node에서 사용할 수 있도록 제작
	node-v0.8.0 이상에서 동작
	libudev 필요
### 설치
	$ sudo apt-get install libudev-dev
	$ npm install udev

### 사용법
	const udev = require('udev');
	const monitor = udev.monitor();

	monitor.on('add', (dev) => {
		// add codes here
	});

	monitor.on('remove', (dev) => {
		// add codes here
	});

	monitor.on('change', (dev) => {
		// add codes here
	});

	monitor.close();
