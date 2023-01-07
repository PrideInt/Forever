require('dotenv').config();
const { token, appid, guildid } = process.env

const { createAudioPlayer } = require('@discordjs/voice');
const { Client, Collection, GatewayIntentBits, Routes } = require('discord.js');
const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates]
})

const YoutubeMp3Downloader = require('youtube-mp3-downloader')
// const { Player } = require('discord-player')
const fs = require('fs')

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

client.commands = new Collection()
client.commandArr = []
client.buttons = new Collection()
client.cycle = 0

client.queue = new Map()
client.videoUserData = new Queue()

client.players = new Map()
client.audioChannels = new Map()
client.current = new Map()

client.ytmp3 = new YoutubeMp3Downloader({
    "ffmpegPath": "./node_modules/ffmpeg-static/ffmpeg.exe",
    "outputPath": "./youtube/mp3",
    "youtubeVideoQuality": "highestaudio",
    "queueParallelism": 5,
    "progressTimeout": 500
})

client.dlProgress = new Map()

// client.discordPlayer = new Player(client)

client.once('ready', () => {
    console.log('Online');
})

/*
async function main() {
    try {
        await client.rest.put(Routes.applicationGuildCommands(appid, guildid), {
            body: []
        })
        await client.login(token)
    } catch (e) {
        console.log(e)
    }
}
*/

const deploys = fs.readdirSync('./src/deploy').filter((f) => f.endsWith(".js"))
const commands = fs.readdirSync('./src/deploy/commands').filter((f) => f.endsWith(".js"))
const interactions = fs.readdirSync('./src/deploy/events').filter((f) => f.endsWith(".js"))

for (const file of deploys) {
    require(`./deploy/${file}`)(client)
}
client.handleEvents()
client.handleCommands()
client.handleComponents()
client.login(token)

/*
client.on('messageCreate', (m) => {
    if (m.content === 'hello') {
        m.reply({ content: 'Hello World!', })
    }
});
*/