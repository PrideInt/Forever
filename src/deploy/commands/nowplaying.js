const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')

module.exports = {
    name: 'nowplaying',
    data: 
    
    new SlashCommandBuilder()
        .setName('nowplaying')
        .setDescription('Displays the current track.'),

    async execute(interaction, client) {
        const data = client.queue.get(interaction.guildId).get(0)
        let embed

        try {
            embed = new EmbedBuilder()
                .setTitle(data.title)
                .setImage(data.thumbnail)
        } catch (e) { 
            embed = new EmbedBuilder()
                .setTitle('Nothing playing.')
                .setThumbnail('https://raw.githubusercontent.com/PrideInt/Forever/readme/readme/euphoriatear.gif')
        }

        await interaction.reply({
            content: 'Now playing:', embeds: [embed], ephemeral: true
        })
    }
}