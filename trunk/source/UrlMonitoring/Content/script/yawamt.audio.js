/// <reference path="jquery.debug.js"/>
/// <reference path="jquery.timers.js"/>
/// <reference path="jquery.sound.js"/>
var demo = false;
var alarmstate = false;
var soundready = false;
var alarm;

function initSound() {
    soundManager.url = flash_dir;
    soundManager.onload = function() {
        soundready = true;
    };
}

function startSound() {

    if (alarmstate || !soundready)
        return;

    alarmstate = true;

    startSoundRepeat();
}

function startSoundRepeat() {

    if (alarm) {
        alarm.stop();
        alarm.destruct();
    }

    alarm = soundManager.createSound({
        id: 'alarm',
        url: alarmsound,
        volume: 50,
        onfinish: function() {
            if (alarmstate)
                setTimeout(startSoundRepeat, 10000);
        }
    });

    alarm.play();
}

function playSound() {
    if (alarmstate || !soundready)
        return;

    var alarmdemo = soundManager.createSound({
        id: 'alarm',
        url: alarmsound,
        volume: 50
    });

    alarmdemo.play();
}

function stopSound() {

    alarmstate = false;
    if (alarm) {
        alarm.stop();
        alarm.destruct();
    }
}