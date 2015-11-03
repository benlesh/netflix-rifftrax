const template = `<div id="nfrt">
  <button id="nfrt-showFind">RiffTrax</button>
  <div class="nfrt-dialog">
    <form id="nfrt-findForm" name="findForm">
      <h3>Load RiffTrax</h3>

      <label for="audioFile">Audio File:</label>
      <input type="file" name="audioFile" id="audioFile" accept=".mp3" required/><br/>

      <label for="syncFile">Sync File:</label>
      <input type="file" name="syncFile" id="syncFile" accept=".sync"/><br/>

      <div>
        <button id="nftr-load" type="submit">Load</button>
      </div>
    </form>
  </div>
  <audio style="display:none;" id="nfrt-audio"/>
</div>`;

const content = document.createElement('div');
content.innerHTML = template;
document.body.appendChild(content);
content.style.display = 'none';

function getSyncOffset(syncURL, callback) {
  var xhr = new XMLHttpRequest();
  xhr.onload = function syncLoaded() {
    const syncData = xhr.responseText;
    const parts = syncData.split('\n');
    var result = -3; // HACK: 3 second offset to get things lined up (unsure why).
    for (var i = 0, len = parts.length; i < len; i++) {
      var innerParts = parts[i].split('=');
      if (innerParts[0] === 'riffdelay_init' || innerParts[0] === 'time_offset') {
        result += +innerParts[1];
      }
    }
    callback(result);
  };
  xhr.open('GET', syncURL);
  xhr.send();
}

const showFindButton = document.querySelector('#nfrt-showFind');
const dialog = document.querySelector('.nfrt-dialog');
const audioFileInput = document.querySelector('#audioFile');
const syncFileInput = document.querySelector('#syncFile');
const findForm = document.querySelector('#nfrt-findForm');
const audio = document.querySelector('#nfrt-audio');

var _video = null;
var _ready = false;
var _offset = 0;

showFindButton.addEventListener('click', () => {
  dialog.style.display = 'block';
  showFindButton.style.display = 'none';
});

findForm.addEventListener('submit', e => {
  const audioURL = URL.createObjectURL(audioFileInput.files[0]);
  const syncURL = URL.createObjectURL(syncFileInput.files[0]);

  getSyncOffset(syncURL, offset => {
    _ready = true;
    _offset = offset;
    audio.src = audioURL;
    audio.currentTime = offset;
  });

  e.preventDefault();

  content.style.display = 'none';
});

function getVideoPlayer(callback) {
  var video = document.querySelector('video');
  if (!video) {
    setTimeout(() => getVideoPlayer(callback), 10);
  } else {
    callback(video);
  }
}

getVideoPlayer(video => {
  _video = video;

  video.addEventListener('pause', function () {
    if (!_ready) {
      content.style.display = 'block';
    }
    audio.pause();
  });

  video.addEventListener('seeking', function () {
    audio.pause();
  });

  video.addEventListener('seeked', function () {
    if (_ready) {
      audio.currentTime = _offset + _video.currentTime;
      audio.play();
    }
  });

  video.addEventListener('playing', function () {
    content.style.display = 'none';
    if (_ready) {
      audio.currentTime = _offset + _video.currentTime;
      audio.play();
    }
  });

  video.addEventListener('timeupdate', () => {
    if (!audio.paused && _ready) {
      const diff = Math.abs(video.currentTime - (audio.currentTime - _offset));
      if (diff > 0.09) {
        console.log('resetting times');
        audio.currentTime = video.currentTime + _offset;
        audio.play();
      }
    }
  });
});
//# sourceMappingURL=nfrt-content.js.map
