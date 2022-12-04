const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')
const { joinVoiceChannel, getVoiceConnection, createAudioPlayer, createAudioResource, AudioPlayerStatus } = require('@discordjs/voice')

const fs = require('fs')
const ffmpeg = require('ffmpeg-static')
const ytsearch = require('youtube-search-without-api-key');

const url = input => {
    var regex = new RegExp('^(https?:\\/\\/)?'+ // validate protocol
	    '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // validate domain name
	    '((\\d{1,3}\\.){3}\\d{1,3}))'+ // validate OR ip (v4) address
	    '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // validate port and path
	    '(\\?[;&a-z\\d%_.~+=-]*)?'+ // validate query string
	    '(\\#[-a-z\\d_]*)?$','i');

    return !!regex.test(input)
}

let conn

module.exports = {
    name: 'play',
    data: 
    
    new SlashCommandBuilder()
        .setName('play')
        .setDescription('Plays music from youtube')
        .addStringOption(track => 
            track
                .setName("track")
                .setDescription("Input the track. Can be a link.")
                .setAutocomplete(false)
                .setRequired(true))
        .addStringOption(source => 
            source
                .setName("source")
                .setDescription("Get music from a source.")
                .setAutocomplete(true)
                .setRequired(false)),

    async autocomplete(interaction) {
        const focused = interaction.options.getFocused(true)

        if (focused.name === 'source') {
            const choices = ['youtube', 'spotify', 'soundcloud']
            const filtered = choices.filter(choice => choice.startsWith(focused.value))

            await interaction.respond(filtered.map(choice => ({
                name: choice,
                value: choice
            })))
        }
    },

    async execute(interaction, client) {
        if (interaction.channel != client.audioChannel) {
            await interaction.reply('You must use commands in **' + client.audioChannel.name + '**.')
            return;
        } else if (interaction.member.voice.channelId == null) {
            await interaction.reply("You must be in a voice channel to use this command.")
            return;
        }
        const option = interaction.options.getString("source")
        const track = interaction.options.getString("track")

        const channel = interaction.member.voice.channelId
        const guildId = interaction.guildId

        let title
        let videoId

        const vc = joinVoiceChannel({
            channelId: channel,
            guildId: guildId,
            adapterCreator: interaction.guild.voiceAdapterCreator
        })
        conn = getVoiceConnection(guildId)
        const videos = await ytsearch.search(track)

        if (url(track)) {
            switch (option) {
                case "youtube":
                    let start
                    if (track.includes('.be')) {
                        start = track.indexOf('/', 10)
                    } else {
                        start = track.indexOf('=')
                    }
                    start++
                    videoId = track.substring(start)
                    break
                case "spotify":
                    break
                case "soundcloud":
                    break
            }
        } else {
            videoId = videos[0].id.videoId
        }
        title = videos[0].title

        const file = fs.readdirSync('./youtube/mp3').filter((f) => f.includes(title) && f.endsWith(".mp3"))
        await interaction.reply({content: 'Adding ' + '**' + title + '**' + ' to the queue...'})

        // If we already have the file somewhere in your local disk, we will
        // add that to the queue instead of manually downloading it again,
        // as it wastes time

        if (file.length === 0) {
            const videoData = { videoId: videoId, user: interaction.user }
            client.videoUserData.enqueue(videoData)
            client.ytmp3.download(videoId)
        } else {
            const data = { 
                title: title,
                user: interaction.user,
                thumbnail: videos[0].snippet.thumbnails.url,
                file: './youtube/mp3/' + title + '.mp3'
            }
            if (client.player.state.status === 'idle') {
                client.player.play(createAudioResource(data.file))
                conn.subscribe(client.player)
            }
            const embed = new EmbedBuilder()
                .setTitle(data.title)
                .setThumbnail(data.thumbnail)
                .setAuthor({
                    name: data.user.username,
                    iconURL: data.user.displayAvatarURL()
                })
                .addFields({
                    name: 'Queue position:', value: '' + client.queue.length
                })
            client.audioChannel.send({
                content: '**' + data.title + '**' + ' added to queue ' + client.queue.length + '.', embeds: [embed]
            })
            client.queue.enqueue(data)
        }
    },

    handler: async ({ client, interaction }) => {
        client.ytmp3.on("finished", function(err, data) {
            for (let i = 0; i < client.videoUserData.length; i++) {
                if (client.videoUserData.get(i).videoId === data.videoId) {
                    user = client.videoUserData.get(i).user
                    data.user = user
                    client.videoUserData.remove(i)
                    break;
                }
            }
            if (client.player.state.status === 'idle') {
                client.player.play(createAudioResource(data.file))
                conn.subscribe(client.player)
            }
            const embed = new EmbedBuilder()
                .setTitle(data.title)
                .setThumbnail(data.thumbnail)
                .setAuthor({
                    name: data.user.username,
                    iconURL: data.user.displayAvatarURL()
                })
                .addFields({
                    name: 'Queue position:', value: '' + client.queue.length
                })

            client.audioChannel.send({
                content: 'Now playing...', embeds: [embed]
            })
            client.queue.enqueue(data)
        });

        client.player.on(AudioPlayerStatus.Idle, () => {
            if (!client.queue.isEmpty && client.queue.length > 1) {
                const data = client.queue.get(1)
                client.queue.dequeue()

                const resource = createAudioResource(data.file)

                const embed = new EmbedBuilder()
                    .setTitle(data.title)
                    .setThumbnail(data.thumbnail)
                    .setAuthor({
                        name: data.user.username,
                        iconURL: data.user.displayAvatarURL()
                    })

                client.audioChannel.send({
                    content: 'Now playing...', embeds: [embed]
                })
                client.player.play(resource)
            }
        })

        client.player.on('error', error => {
            console.log(JSON.stringify(error))
            if (client.videoData.length > 0) {
                client.videoUserData.remove(client.videoUserData.length - 1)
            }
        })
        
        client.ytmp3.on("error", function(error) {
            console.log('Error downloading youtube stuff')
            console.log(JSON.stringify(error));
        });

        /*
        client.ytmp3.on("progress", function(progress) {
            console.log("Progressing... " + progress.progress.percentage)
        });
        */
    },
}