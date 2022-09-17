/* global io */
const socket = io();
const telegraph = document.getElementById("telegraph");
var url =
  "beep1.mp3"; // use any valid audio file if this disappears over time...
var pitch = 0;
var pitchShift = undefined;
var playerList = [];
var audioPlayers = Array(100).fill(["", ""]);
var menuShown = false;

var beep1 = new Tone.Player(
  "beep1.mp3"
);
beep1.autostart = false;
beep1.loop = true;

var beep2 = new Tone.Player(
  "beep2.mp3"
);
beep2.autostart = false;
beep2.loop = true;

document.getElementById("range").value = 0;
document.getElementById("beepone").checked = true;

document.getElementById("range").addEventListener("input", function () {
  document.getElementById("rangeNumber").innerHTML =
    document.getElementById("range").value;
});

document.getElementById("beepone").addEventListener("change", function () {
  url =
    "beep1.mp3";
});

document.getElementById("beeptwo").addEventListener("change", function () {
  url =
    "beep2.mp3";
});

document.getElementById("audioButton").addEventListener("click", function () {
  if (menuShown) {
    document.getElementById("audioMenu").classList.remove("fadeIn");
    menuShown = !menuShown;
  } else {
    document.getElementById("audioMenu").classList.add("fadeIn");
    menuShown = !menuShown;
  }
});

socket.on("connect", async () => {
  await Tone.start();
  await Tone.loaded();
});

telegraph.addEventListener("mousedown", async () => {
  document.getElementById("telegraphImage").src =
    "telegraphOn.png";
  pitch = document.getElementById("range").value;

  socket.emit("button pressed", socket.id, url, pitch);

  if (pitchShift == undefined || pitchShift.pitch != pitch) {
    pitchShift = new Tone.PitchShift({ pitch: pitch }).toDestination();
  }

  if (
    url ==
    "beep1.mp3"
  ) {
    beep1.connect(pitchShift);
    beep1.start();
  } else if (
    url ==
    "beep2.mp3"
  ) {
    beep2.connect(pitchShift);
    beep2.start();
  }
});

document.addEventListener(
  "contextmenu",
  function (e) {
    e.preventDefault();
  },
  false
);

window.addEventListener("mouseup", async () => {
  document.getElementById("telegraphImage").src =
    "telegraphOff.png";
  socket.emit("button released", socket.id);
  if (
    url ==
    "beep1.mp3"
  ) {
    beep1.stop();
    beep1.disconnect();
  } else if (
    url ==
    "beep2.mp3"
  ) {
    beep2.stop();
    beep2.disconnect();
  }
});

window.addEventListener("blur", async () => {
  document.getElementById("telegraphImage").src =
    "telegraphOff.png";
  socket.emit("button released", socket.id);
  if (
    url ==
    "beep1.mp3"
  ) {
    beep1.stop();
    beep1.disconnect();
  } else if (
    url ==
    "beep2.mp3"
  ) {
    beep2.stop();
    beep2.disconnect();
  }
});

socket.on("start beep", (players, id) => {
  playerList = players;
  if (id != socket.id) {
    for (let play of playerList) {
      if (play.id == id) {
        if (
          play.beep ==
          "beep1.mp3"
        ) {
          audioPlayers[play.index][0] = new Tone.Player(
            "beep1.mp3"
          );
          audioPlayers[play.index][0].autostart = false;
          audioPlayers[play.index][0].loop = true;
          audioPlayers[play.index][1] = new Tone.PitchShift({
            pitch: play.pitch,
          }).toDestination();
          audioPlayers[play.index][0].connect(audioPlayers[play.index][1]);
          var buffer = new Tone.Buffer(
            "beep1.mp3",
            function () {
              audioPlayers[play.index][0].start();
            }
          );
        } else if (
          play.beep ==
          "beep2.mp3"
        ) {
          audioPlayers[play.index][0] = new Tone.Player(
            "beep2.mp3"
          );
          audioPlayers[play.index][0].autostart = false;
          audioPlayers[play.index][0].loop = true;
          audioPlayers[play.index][1] = new Tone.PitchShift({
            pitch: play.pitch,
          }).toDestination();
          audioPlayers[play.index][0].connect(audioPlayers[play.index][1]);
          var buffer = new Tone.Buffer(
            "beep2.mp3",
            function () {
              audioPlayers[play.index][0].start();
            }
          );
        }
      }
    }
  }
});

socket.on("end beep", (id, index) => {
  if (id != socket.id && audioPlayers[index] != undefined) {
    audioPlayers[index][0].stop();
    audioPlayers[index][0].disconnect();
  }
});
