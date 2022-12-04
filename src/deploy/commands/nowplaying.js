const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')

module.exports = {
    name: 'nowplaying',
    data: 
    
    new SlashCommandBuilder()
        .setName('nowplaying')
        .setDescription('Displays the current track.'),

    async execute(interaction, client) {
        const data = client.queue.get(0)
        let embed

        try {
            embed = new EmbedBuilder()
                .setTitle(data.title)
                .setImage(data.thumbnail)
        } catch (e) { 
            embed = new EmbedBuilder()
                .setTitle('Nothing playing.')
                .setThumbnail('https://cdn.discordapp.com/attachments/944560551621709848/1038285032604827728/IMG_9412.jpg')
        }

        await interaction.reply({
            content: 'Now playing:', embeds: [embed], ephemeral: true
        })
    }
}