rpc = require('discord-rich-presence')('783728735278858253');
const {execSync} = require('child_process');
const { parse } = require('path');
const config = require('./config.json');
var currentSong;
var currentPosition;

function grabData(){
	this.artist = execSync("/usr/bin/osascript -e 'tell application \"Music\" to get artist of current track as string'");
	this.track = execSync("/usr/bin/osascript -e 'tell application \"Music\" to get name of current track as string'");
	this.position = execSync("/usr/bin/osascript -e 'tell application \"Music\" to get player position'");
	this.duration = execSync("/usr/bin/osascript -e 'tell application \"Music\" to get duration of current track'");

	return this;
}
function updatePresence(paused, details){
	rpc.updatePresence({
		state: `${(config.emojis ? "🎧 " : "")}${details.track}`,
		details: `${(config.emojis ? "🎤 " : "")}${details.artist}`,
		endTimestamp: Date.now() + ((parseInt(details.duration) - parseInt(details.position)) * 1000),
		largeImageKey: 'apple_music_1',
		largeImageText: 'Apple Music',
		smallImageKey: `${(paused ? "pause" : "play")}`,
		smallImageText: `by Zenternal`,
		instance: true,
	});
	currentSong = `${details.artist} - ${details.track}`;
}
function clearPresence(){
	// Still need to figure this out.
}

function update(){
	var playerState = execSync("/usr/bin/osascript -e 'tell application \"Music\" to get player state'");
	playerState = `${playerState}`;

	if(playerState.includes("paused")){
		details = grabData(); 
		updatePresence(true, details);
	}
	else if(playerState.includes("stopped")){
		if(rpc){  clearPresence() };
	}
	else if(playerState.includes("playing")){
		details = grabData();
		if(parseInt(details.position) > currentPosition + 5 ||
			parseInt(details.position) < currentPosition - 5){
			return updatePresence(false, details);
		}
		currentPosition = parseInt(details.position);
		if(currentSong === `${details.artist} - ${details.track}`) return;
		updatePresence(false, details);
	}
	else{
		if(rpc){ clearPresence(); }
	}
}

setInterval( function(){ update(); }, 2000);