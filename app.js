console.log('Smart Room OS V4 Loaded');

const dummyData = {

  climate: {
    temp: 27,
    humidity: 74
  },

  smartplug: {
    power: 355,
    voltage: 223
  },

  ac: {
    power: 'ON',
    temp: 27,
    mode: 'COOL',
    fan: 'AUTO'
  },

  lamp: {
    power: 'ON',
    brightness: 70,
    mode: 'WHITE'
  },

  tv: {
    power: 'ON',
    status: 'YouTube'
  },

  nest: {
    online: true,
    status: 'IDLE',
    volume: 30
  },

  cctv: {
    online: 'ONLINE',
    motion: 'NO MOTION',
    recording: 'ON'
  },

  lastAutomation: {
    scene: 'Movie Mode',
    timestamp: '13 Jun 2026 16:38'
  }

};

renderDashboard(dummyData);

function renderDashboard(data){

  document.getElementById('roomTemp').textContent =
    data.climate.temp + '°C';

  document.getElementById('roomHumidity').textContent =
    data.climate.humidity + '%';

  document.getElementById('plugPower').textContent =
    data.smartplug.power + 'W';

  document.getElementById('plugVolt').textContent =
    data.smartplug.voltage + 'V';

  document.getElementById('acTemp').textContent =
    data.ac.temp + '°C';

  document.getElementById('acStatus').textContent =
    data.ac.power;

  document.getElementById('acMode').textContent =
    data.ac.mode;

  document.getElementById('acFan').textContent =
    data.ac.fan;

  document.getElementById('lampStatus').textContent =
    data.lamp.power;

  document.getElementById('lampBrightness').textContent =
    data.lamp.brightness + '%';

  document.getElementById('lampMode').textContent =
    data.lamp.mode;

  document.getElementById('lampBar').style.width =
    data.lamp.brightness + '%';

  document.getElementById('tvStatus').textContent =
    data.tv.status;

  document.getElementById('nestStatus').textContent =
    data.nest.status;

  document.getElementById('nestVolume').textContent =
    data.nest.volume;

  document.getElementById('cctvOnline').textContent =
    data.cctv.online;

  document.getElementById('cctvMotion').textContent =
    data.cctv.motion;

  document.getElementById('cctvRecording').textContent =
    data.cctv.recording;

  document.getElementById('sceneName').textContent =
    data.lastAutomation.scene;

  document.getElementById('sceneDate').textContent =
    data.lastAutomation.timestamp;

  document.getElementById('sceneTime').textContent =
    '🕒';

  if(data.ac.power === 'ON'){
    document
      .getElementById('acPowerBadge')
      .className = 'badge on';
  }

  if(data.lamp.power === 'ON'){
    document
      .getElementById('lampPowerBadge')
      .className = 'badge on';
  }

  if(data.tv.power === 'ON'){
    document
      .getElementById('tvPowerBadge')
      .className = 'badge on';
  }

  if(data.nest.online){
    document
      .getElementById('nestPowerBadge')
      .className = 'badge on';
  }

}
