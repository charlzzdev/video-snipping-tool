const { desktopCapturer } = require('electron');

let recorder, blobs = [];
const video = document.querySelector('video');
const startButton = document.getElementById('start-button');
const stopButton = document.getElementById('stop-button');
const audioCheckbox = document.getElementById('audio-checkbox');
const formatDropdown = document.getElementById('format-dropdown');

// get main screen
desktopCapturer.getSources({ types: ['screen'] })
  .then(async sources => {
    try {
      // get the stream on start button click
      startButton.addEventListener('click', async e => {
        const stream = await navigator.mediaDevices.getUserMedia({
          // record audio if the corresponding checkbox is checked
          audio: audioCheckbox.checked && {
            mandatory: {
              chromeMediaSource: 'desktop'
            }
          },
          video: {
            mandatory: {
              chromeMediaSource: 'desktop'
            }
          }
        });

        handleStream(stream);
      });
    } catch (error) {
      console.log(error);
    }
  });

const handleStream = stream => {
  // setup recorder
  recorder = new MediaRecorder(stream);

  // store stream data in global `blobs` variable
  recorder.ondataavailable = e => blobs.push(e.data);
  // display video after stopping
  recorder.onstop = async () => {
    let blob = new Blob(blobs, { type: formatDropdown.value });
    video.src = window.URL.createObjectURL(blob);
  }

  // start recording
  recorder.start();

  stopButton.addEventListener('click', e => {
    // destroy all stream connections
    stream.getTracks().forEach(track => track.stop());

    // stop recording
    recorder.stop();
    // disable stopping & enable starting
    startButton.disabled = false;
    stopButton.disabled = true;
  });

  // disable starting & enable stopping
  startButton.disabled = true;
  stopButton.disabled = false;
}

