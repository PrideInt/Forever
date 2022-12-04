const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')

module.exports = {
    name: 'queue',
    data: 
    
    new SlashCommandBuilder()
        .setName('queue')
        .setDescription('Displays the current queue of the bot.'),

    async execute(interaction, client) {
        let description = ''

        if (!client.queue.isEmpty) {
            for (let i = 0; i < client.queue.length; i++) {
                const data = client.queue.get(i)
                if (i === 0) {
                    description += '**' + 'Current: ' + data.title + '** - ' + data.user.username + '\n\n' 
                } else {
                    description += '**' + i + ': ' + data.title + '** - ' + data.user.username + '\n\n' 
                }
            }
        } else {
            description += '**Nothing in queue.**'
        }

        const embed = new EmbedBuilder()
            .setTitle('Queue')
            .setThumbnail('https://cdn.discordapp.com/attachments/944560551621709848/1048672072047546398/IMG_0838.gif')
            .setAuthor({
                name: 'Forever',
                iconURL: 'https://cdn.discordapp.com/attachments/944560551621709848/1038285032604827728/IMG_9412.jpg'
            })
            .setDescription(description)

        await interaction.reply({
            embeds: [embed]
        })
    }
}