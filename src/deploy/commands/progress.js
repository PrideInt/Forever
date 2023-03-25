const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')

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
            .setThumbnail('https://raw.githubusercontent.com/PrideInt/Forever/readme/euphoriatear.gif')
            .setAuthor({
                name: 'Forever',
                iconURL: 'https://raw.githubusercontent.com/PrideInt/Forever/readme/euphoriatear.jpg'
            })
            .setDescription(description)

        await interaction.reply({
            embeds: [embed],
            ephemeral: true
        })
    },
}