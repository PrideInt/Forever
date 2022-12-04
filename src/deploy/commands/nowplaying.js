const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')

module.exports = {
    name: 'nowplaying',
    data: 
    
    new SlashCommandBuilder()
        .setName('nowplaying')
        .setDescription('Displays the current track.'),

    async execute(interaction, client) {
        const data = client.queue.get(0)

        const embed = new EmbedBuilder()
            .setTitle(data.title)
            .setImage(data.thumbnail)

        await interaction.reply({
            content: 'Now playing:', embeds: [embed], ephemeral: true
        })
    }
}