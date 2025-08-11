var player = require('play-sound')(opts = {})

player.play("./sound/soundAlarmTv.mp3", function(err) {
  if (err) throw err
})
