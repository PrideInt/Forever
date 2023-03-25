# Forever

![euphoriatear](https://raw.githubusercontent.com/PrideInt/Forever/readme/euphoriatear.gif)

## What it is

Forever is a music bot that I made for myself (Pride) for Discord. It's pretty easy to use and currently only supports
YouTube. Has a neat modern design and very much unlike other old and outdated music bots. Will be adding
more stuff to it, and the code is a bit messy, but it works and quite effectively.

## In action and commands

### Autoplay function

Forever automatically plays the next track on the queue (if there are any left), whenever the current track is
over or if it is skipped. The embed also shows the current track playing, the next track up and the next 3 tracks
on the queue.

> ![foreverautoplay](https://raw.githubusercontent.com/PrideInt/Forever/readme/foreverautoplay.png)

### /play

> ![foreverplay](https://raw.githubusercontent.com/PrideInt/Forever/readme/foreverplay.png)

The play command plays a track given an inputted track option (can be either keywords or a link) and a source selection
type (e.g. YouTube, Spotify, SoundCloud, however only YouTube is the only functional source as of now). You
must be in a voice channel in order to perform this command. Additionally, the very first play command in a given
channel will assign the bot to broadcast and be used only in that channel. To change this, you must use the assign command.

> ![foreverplayaction](https://raw.githubusercontent.com/PrideInt/Forever/readme/foreverplayaction.png)

### /skip

> ![foreverskip](https://raw.githubusercontent.com/PrideInt/Forever/readme/foreverskip.png)

The skip command skips the track in a given position (current - queue size). You may also use the skip button to skip
a track.

> ![foreverskipaction](https://raw.githubusercontent.com/PrideInt/Forever/readme/foreverskipaction.png)

### /assign

> ![foreverassign](https://raw.githubusercontent.com/PrideInt/Forever/readme/foreverassign.png)

The assign command assigns the bot to a specific channel (the channel the assign command is used in). Commands will
only broadcast and work in this channel unless changed again using this command.

### /progress

> ![foreverprogress](https://raw.githubusercontent.com/PrideInt/Forever/readme/foreverprogress.png)

The progress command shows the progress (percentage of download completion) of the currently downloading tracks.

> ![foreverprogressaction](https://raw.githubusercontent.com/PrideInt/Forever/readme/foreverprogressaction.png)

### /nowplaying

> ![forevernp](https://raw.githubusercontent.com/PrideInt/Forever/readme/forevernp.png)

The nowplaying command shows the current track that is playing.

> ![forevernpaction](https://raw.githubusercontent.com/PrideInt/Forever/readme/forevernpaction.png)

## Dependencies

discord.js, @discordjs/voice, ffmpeg-static, libsodium-wrappers, youtube-mp3-downloader (*for quicker downloading speeds, replace ytdl-core in node_modules with the latest version*), 
ytsr, ytdl-core (*latest*)
