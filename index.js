const rpc = require('discord-rich-presence')('783728735278858253');
const { execSync } = require('child_process');

function grabData(){
  this.artist = execSync("/usr/bin/osascript -e 'tell application \"Music\" to get artist of current track as string'");
  this.track = execSync("/usr/bin/osascript -e 'tell application \"Music\" to get name of current track as string'");
  this.position = execSync("/usr/bin/osascript -e 'tell application \"Music\" to get player position'");
  this.duration = execSync("/usr/bin/osascript -e 'tell application \"Music\" to get duration of current track'");

  return this;
}

function updatePresence(paused, details){
  rpc.updatePresence({
    state: `🎧 ${details.track}`,
    details: `🎤 ${details.artist}`,
    endTimestamp: Date.now() + ((parseInt(details.duration) - parseInt(details.position)) * 1000),
    largeImageKey: 'apple_music_1',
    smallImageKey: `${(paused ? "pause" : "play")}`,
    instance: true,
  });
}

function clearPresence(){
  rpc.updatePresence({
    state: `  `,
    details: `  `,
    instance: false,
  });
}

function update(){
  var playerState = execSync("/usr/bin/osascript -e 'tell application \"Music\" to get player state'");
  playerState = `${playerState}`;

  if(playerState.includes('paused')){
    details = grabData();
    updatePresence(true, details);
  } else if(playerState.includes("stopped")){
    if(rpc){ clearPresence() };
  } else if(playerState.includes("playing")){
    details = grabData();
    updatePresence(false, details);
  } else {
    if(rpc){ clearPresence() };
  }
}

setInterval(() => {
  update();
}, 2000)
