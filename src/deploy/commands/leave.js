const { SlashCommandBuilder } = require('discord.js')
const { getVoiceConnection, createAudioPlayer } = require('@discordjs/voice')

module.exports = {
    name: 'leave',
    data: 
    
    new SlashCommandBuilder()
        .setName('leave')
        .setDescription('Leave all voice channel it\'s in.'),

    async execute(interaction, client) {
        client.players.get(interaction.guildId).stop()
        client.queue.get(interaction.guildId).clear()
        getVoiceConnection(interaction.guildId).destroy()

        await interaction.reply({content: 'Left the voice channel.'})
    }
}