require('dotenv').config();
const { token, appid, guildid } = process.env

const { createAudioPlayer } = require('@discordjs/voice');
const { Client, Collection, GatewayIntentBits, Routes } = require('discord.js');
const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates]
})

const YoutubeMp3Downloader = require('youtube-mp3-downloader')
const fs = require('fs')

client.commands = new Collection();
client.commandArr = []
client.cycle = 0

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

client.queue = new Queue()
client.player = createAudioPlayer()
client.audioChannel
client.ytmp3 = new YoutubeMp3Downloader({
    "ffmpegPath": "./node_modules/ffmpeg-static/ffmpeg.exe",
    "outputPath": "./youtube/mp3",
    "youtubeVideoQuality": "highestaudio"
})

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
client.login(token)

/*
client.on('messageCreate', (m) => {
    if (m.content === 'hello') {
        m.reply({ content: 'Hello World!', })
    }
});
*/