const { SlashCommandBuilder } = require('discord.js')
const { getVoiceConnection, createAudioPlayer } = require('@discordjs/voice')

module.exports = {
    name: 'leave',
    data: 
    
    new SlashCommandBuilder()
        .setName('leave')
        .setDescription('Leave all voice channel it\'s in.'),

    async execute(interaction, client) {
        client.player.stop()
        client.queue.clear()
        createAudioPlayer().stop()
        getVoiceConnection(interaction.guildId).destroy()

        await interaction.reply({content: 'Left the voice channel.'})
    }
}