const { SlashCommandBuilder } = require('discord.js')

module.exports = {
    name: 'assign',
    data: 
    
    new SlashCommandBuilder()
        .setName('assign')
        .setDescription('Assigns bot to a specific channel.'),

    async execute(interaction, client) {
        client.audioChannels.set(interaction.guildId, interaction.channel)
        await interaction.reply({content: 'Assigned channel to **' + interaction.channel.name + '**.'})
    }
}