const KNOWN_RIFFS = {
  '1181616': {
    name: 'Starship Troopers',
    offset: 181.3,
    videoVolume: 1
  },
  '60026347': {
    name: 'Road House',
    offset: 146.8,
    videoVolume: 0.6
  },
  '1056189': {
    offset: 124.6,
    name: 'Top Gun',
    videoVolume: 1
  }
};

const template = `<div id="nfrt">
  <button id="nfrt-showFind">RiffTrax</button>
  <div class="nfrt-dialog">
    <form id="nfrt-findForm" name="findForm">
      <h3>Load RiffTrax</h3>

      <div class="row">
        <label for="audioFile">Audio File:</label>
        <input type="file" name="audioFile" id="audioFile" accept=".mp3" required/><br/>
      </div>

      <div class="row">
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

const showFindButton = document.querySelector('#nfrt-showFind');
const dialog = document.querySelector('.nfrt-dialog');
const audioFileInput = document.querySelector('#audioFile');
const findForm = document.querySelector('#nfrt-findForm');
const audio = document.querySelector('#nfrt-audio');

var _ready = false;
var _offset = 0;

function getMovieID() {
  var href = window.location.href;
  var matches = /netflix.com\/watch\/(\d+)[\/\?]*/.exec(href);
  if(matches) {
    return matches[1];
  }
  return null;
}

function getRiff() {
  var id = getMovieID();
  return KNOWN_RIFFS[id];
}

showFindButton.addEventListener('click', () => {
  dialog.style.display = 'block';
  showFindButton.style.display = 'none';
});

findForm.addEventListener('submit', e => {
  const audioURL = URL.createObjectURL(audioFileInput.files[0]);

  console.log(getMovieID());
  const riff = KNOWN_RIFFS[getMovieID()];

  console.info('loaded riff: ' + riff.name);

  _ready = true;
  _offset = riff.offset;
  audio.src = audioURL;
  audio.currentTime = _offset;

  e.preventDefault();

  content.style.display = 'none';
});


function getVideoPlayer(callback) {
  var video = document.querySelector('video');
  if(!video) {
    setTimeout(() => getVideoPlayer(callback), 10);
  } else {
    callback(video);
  }
}

getVideoPlayer(video => {
  video.addEventListener('pause', function () {
    if(!_ready) {
      var riff = getRiff();
      if(riff) {
        video.volume = riff.videoVolume;
        content.style.display = 'block';
      }
    }
    audio.pause();
  });

  video.addEventListener('seeking', function () {
    audio.pause();
  });

  video.addEventListener('seeked', function () {
    if(_ready) {
      var riff = getRiff();
      if(!riff) {
        _ready = false;
        audio.pause();
        return;
      }
      audio.currentTime = _offset + video.currentTime;
      audio.play();
    }
  });

  video.addEventListener('playing', function () {
    content.style.display = 'none';
    if (_ready) {
      var riff = getRiff();
      if(!riff) {
        _ready = false;
        audio.pause();
        return;
      }
      video.volume = riff.videoVolume;
      audio.currentTime = _offset + video.currentTime;
      audio.play();
    }
  });


  video.addEventListener('timeupdate', () => {
    if(!audio.paused && _ready) {
      const diff = Math.abs((video.currentTime) - (audio.currentTime - _offset));
      if(diff > 0.09) {
        console.log('resetting times');
        audio.currentTime = video.currentTime + _offset;
        audio.play();
      }
    }
  });
});
