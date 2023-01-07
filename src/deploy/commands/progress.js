const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')
const ytsearch = require('youtube-search-without-api-key');

module.exports = {
    name: 'progress',
    data: 
    
    new SlashCommandBuilder()
        .setName('progress')
        .setDescription('Returns the progress of downloading tracks.'),

    async execute(interaction, client) {
        let description = ""
        if (client.dlProgress.keys().length === 0) {
            description = "Nothing in progress."
        } else {
            for (const key of client.dlProgress.keys()) {
                description += "**" + key + "**: " + (Math.round(client.dlProgress.get(key) * 100) / 100) + "%\n\n"
            }
        }
        const embed = new EmbedBuilder()
            .setTitle('Tracks downloading in progress:')
            .setThumbnail('https://cdn.discordapp.com/attachments/944560551621709848/1048672072047546398/IMG_0838.gif')
            .setAuthor({
                name: 'Forever',
                iconURL: 'https://cdn.discordapp.com/attachments/944560551621709848/1038285032604827728/IMG_9412.jpg'
            })
            .setDescription(description)

        await interaction.reply({
            embeds: [embed],
            ephemeral: true
        })
    },
}