const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js')
const { joinVoiceChannel, getVoiceConnection, createAudioPlayer, createAudioResource, AudioPlayerStatus } = require('@discordjs/voice')

const fs = require('fs')
const ffmpeg = require('ffmpeg-static')
const ytsearch = require('ytsr')

const url = input => {
    var regex = new RegExp('^(https?:\\/\\/)?'+ // validate protocol
	    '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // validate domain name
	    '((\\d{1,3}\\.){3}\\d{1,3}))'+ // validate OR ip (v4) address
	    '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // validate port and path
	    '(\\?[;&a-z\\d%_.~+=-]*)?'+ // validate query string
	    '(\\#[-a-z\\d_]*)?$','i');

    return !!regex.test(input)
}

const ytdl = require('ytdl-core')

class Queue {
    constructor() {
        this.elements = [];
    }
    enqueue(element) {
        this.elements.push(element);
    }
    dequeue() {
        return this.elements.shift();
    }
    peek() {
        return this.elements[0];
    }
    queue() {
        return this.elements;
    }
    remove(position) {
        return this.elements.splice(position, 1);
    }
    get(position) {
        return this.elements[position];
    }
    clear() {
        while (!this.isEmpty) {
            this.elements.shift()
        }
    }
    get length() {
        return this.elements.length;
    }
    get isEmpty() {
        return this.elements.length === 0;
    }
}

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
                .setRequired(true))
        .addStringOption(quality => 
            quality
                .setName("quality")
                .setDescription("Play track according to quality.")
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
        } else if (focused.name === 'quality') {
            const choices = ['low', 'high']
            const filtered = choices.filter(choice => choice.startsWith(focused.value))

            await interaction.respond(filtered.map(choice => ({
                name: choice,
                value: choice
            })))
        }
    },

    async execute(interaction, client) {
        if (!client.queue.has(interaction.guildId)) {
            client.queue.set(interaction.guildId, new Queue())
        }
        if (!client.players.has(interaction.guildId)) {
            const audioPlayer = createAudioPlayer()
            client.players.set(interaction.guildId, audioPlayer)
            await this.onPlayer(interaction, client, audioPlayer)
        }
        const audioChannel = client.audioChannels.get(interaction.guildId)
        const player = client.players.get(interaction.guildId)
        const queue = client.queue.get(interaction.guildId)

        if (interaction.channel != audioChannel) {
            await interaction.reply({
                content: 'You must use commands in **' + audioChannel.name + '**.', ephemeral: true
            })
            return;
        } else if (interaction.member.voice.channelId == null) {
            await interaction.reply({
                content: 'You must be in a voice channel to use this command.', ephemeral: true
            })
            return;
        }
        const option = interaction.options.getString("source")
        const track = interaction.options.getString("track")
        const quality = interaction.options.getString("quality")

        if (track.length == 0) {
            await interaction.reply({
                content: 'Enter a track.', ephemeral: true
            })
            return;
        }

        const channel = interaction.member.voice.channelId
        const guildId = interaction.guildId

        let title
        let thumbnail
        let videoId

        const vc = joinVoiceChannel({
            channelId: channel,
            guildId: guildId,
            adapterCreator: interaction.guild.voiceAdapterCreator
        })
        const conn = getVoiceConnection(guildId)

        /*
        if (quality === 'low') {
            const info = await ytdl.getInfo(track, {
                filter: 'audioonly',
                quality: 'highest'
            })
            await ytdl.downloadFromInfo(info).pipe(fs.createWriteStream('./youtube/mp3/testtest.mp3'));
            return;
        }
        */

        if (url(track)) {
            if (option === '') {
                let start
                if (track.includes('.be')) {
                    start = track.indexOf('/', 10)
                } else {
                    start = track.indexOf('=')
                }
                start++
                videoId = track.substring(start, start + 11)

                const videoInfo = await ytsearch(track, { pages: 1 })
                videoId = videoInfo.items[0].id
                title = videoInfo.items[0].title
                thumbnail = videoInfo.items[0].bestThumbnail.url;
            } else {
                switch (option) {
                    case "youtube":
                        let start
                        if (track.includes('.be')) {
                            start = track.indexOf('/', 10)
                        } else {
                            start = track.indexOf('=')
                        }
                        start++
                        videoId = track.substring(start, start + 11)
    
                        const videoInfo = await ytsearch(track, { pages: 1 })
                        videoId = videoInfo.items[0].id
                        title = videoInfo.items[0].title
                        thumbnail = videoInfo.items[0].bestThumbnail.url;
                        break
                    case "spotify":
                        break
                    case "soundcloud":
                        break
                }
            }
        } else {
            // console.log(track)
            const videos = await ytsearch(track, { pages: 1 })
            videoId = videos.items[0].id
            title = videos.items[0].title
            thumbnail = videos.items[0].bestThumbnail.url;
        }

        const fileName = title.replace('\\', '').replace('/', '').replace(':', '').replace('*', '').replace('?', '').replace('"', '').replace('|', '').replace('<', '').replace('>', '')

        const file = fs.readdirSync('./youtube/mp3').filter((f) => f.includes(fileName) && f.endsWith(".mp3"))
        try {
            await interaction.reply({content: 'Adding ' + '**' + title + '**' + ' to the queue...'})
        } catch (e) { 
            console.log('no')
        }

        // If we already have the file somewhere in your local disk, we will
        // add that to the queue instead of manually downloading it again,
        // as it wastes time

        client.dlProgress.set(title, '0')

        if (file.length === 0) {
            const videoData = { videoId: videoId, user: interaction.user, channel: interaction.channel, guildId: interaction.guildId }
            client.videoUserData.enqueue(videoData)
            client.ytmp3.download(videoId)
        } else {
            const data = { 
                title: title,
                user: interaction.user,
                thumbnail: thumbnail,
                file: './youtube/mp3/' + title + '.mp3',
                channel: audioChannel,
                guildId: interaction.guildId
            }
            let queuePosition = '' + queue.length
            let message = 'Added to queue'
            let addButton = false

            if (player.state.status === 'idle') {
                player.play(createAudioResource(data.file))
                conn.subscribe(player)

                queuePosition = 'Current'
                message = 'Now playing'
                addButton = true
            }
            const embed = new EmbedBuilder()
                .setTitle(data.title)
                .setThumbnail(data.thumbnail)
                .setAuthor({
                    name: data.user.username,
                    iconURL: data.user.displayAvatarURL()
                })
                .addFields({
                    name: 'Queue position:', value: queuePosition, inline: true
                },{
                    name: 'Status:', value: message, inline: true
                })

            if (addButton) {
                const row = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('skip-b')
                            .setLabel('Skip')
                            .setStyle(ButtonStyle.Danger),
                    )
                    
                const message = audioChannel.send({
                    embeds: [embed], components: [row]
                })
                client.current.set(interaction.guildId, message.id)
            } else {
                audioChannel.send({
                    embeds: [embed]
                })
            }
            queue.enqueue(data)
        }
    },

    handler: async ({ client, interaction }) => {
        client.ytmp3.on("error", function(error) {
            console.log(error)
        })
        client.ytmp3.on("progress", async function(progress) {
            const videoInfo = await ytdl.getBasicInfo('https://www.youtube.com/watch?v=' + progress.videoId);
            title = videoInfo.videoDetails.title
            client.dlProgress.set(title, progress.progress.percentage + '')
        })
        client.ytmp3.on("finished", function(err, data) {
            for (let i = 0; i < client.videoUserData.length; i++) {
                if (client.videoUserData.get(i).videoId === data.videoId) {
                    const videoData = client.videoUserData.get(i)

                    const user = videoData.user
                    const guildId = videoData.guildId
                    const audioChannel = videoData.channel

                    data.user = user
                    data.guildId = guildId
                    data.channel = audioChannel

                    client.videoUserData.remove(i)
                    break;
                }
            }
            const queue = client.queue.get(data.guildId)
            let queuePosition = '' + queue.length
            let message = 'Added to queue'
            let addButton = false
            const player = client.players.get(data.guildId)

            if (player.state.status === 'idle') {
                player.play(createAudioResource(data.file))
                getVoiceConnection(data.guildId).subscribe(player)

                queuePosition = 'Current'
                message = 'Now playing'
                addButton = true
            }
            const embed = new EmbedBuilder()
                .setTitle(data.title)
                .setThumbnail(data.thumbnail)
                .setAuthor({
                    name: data.user.username,
                    iconURL: data.user.displayAvatarURL()
                })
                .addFields({
                    name: 'Queue position:', value: queuePosition, inline: true
                },{
                    name: 'Status:', value: message, inline: true
                })

            if (addButton) {
                const row = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('skip-b')
                            .setLabel('Skip')
                            .setStyle(ButtonStyle.Danger),
                    )
                const message = data.channel.send({
                    embeds: [embed], components: [row]
                })
                client.current.set(interaction.guildId, message.id)
            } else {
                data.channel.send({
                    embeds: [embed]
                })
            }
            queue.enqueue(data)
        });

        /*
        client.ytmp3.on("progress", function(progress) {
            console.log("Progressing... " + progress.progress.percentage)
        });
        */
    },

    async onPlayer(interaction, client, player) {
        const queue = client.queue.get(interaction.guildId)
        await player.on(AudioPlayerStatus.Idle, () => {
            if (!queue.isEmpty && queue.length >= 1) {
                queue.dequeue()
                if (queue.isEmpty) {   
                    return;
                }
                const data = queue.get(0)

                const resource = createAudioResource(data.file)

                const embed = new EmbedBuilder()
                    .setTitle('Now playing **' + data.title + '**.')
                    .setThumbnail(data.thumbnail)
                    .setAuthor({
                        name: data.user.username,
                        iconURL: data.user.displayAvatarURL()
                    })

                if (queue.get(1) == null) {
                    embed.setDescription('Nothing left in queue.')
                } else if (queue.get(2) == null && queue.get(1) != null) {
                    embed.addFields({ name: 'Next up:', value: queue.get(1).title })
                } else {
                    embed.addFields({
                        name: 'Next up:', value: queue.get(1).title
                    },{
                        name: 'Queue 2:', value: queue.get(2).title, inline: true
                    },{
                        name: 'Queue 3:', value: queue.get(3) == null ? 'None' : queue.get(3).title, inline: true
                    },{
                        name: 'Queue 4:', value: queue.get(4) == null ? 'None' : queue.get(4).title, inline: true
                    })
                }

                const row = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('skip-b')
                            .setLabel('Skip')
                            .setStyle(ButtonStyle.Danger),
                    )

                const message = data.channel.send({
                    embeds: [embed], components: [row]
                })
                client.current.set(interaction.guildId, message.id)

                client.players.get(data.guildId).play(resource)
            }
        })

        player.on('error', error => {
            console.log(JSON.stringify(error))
            if (client.videoData.length > 0) {
                client.videoUserData.remove(client.videoUserData.length - 1)
            }
        })
    },
}