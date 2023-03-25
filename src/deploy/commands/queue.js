const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')

module.exports = {
    name: 'queue',
    data: 
    
    new SlashCommandBuilder()
        .setName('queue')
        .setDescription('Displays the current queue of the bot.'),

    async execute(interaction, client) {
        let description = ''

        const queue = client.queue.get(interaction.guildId)

        try {
            if (!queue.isEmpty) {
                for (let i = 0; i < queue.length; i++) {
                    const data = queue.get(i)

                    switch (i) {
                        case 0:
                            description += '**Current:** ' + data.title + ' - **' + data.user.username + '**' + '\n\n' 
                            break
                        case 1:
                            description += '**Next up:** ' + data.title + ' - **' + data.user.username + "**" + '\n\n' 
                            break
                        default:
                            description += '**Queue ' + i + ':** ' + data.title + ' - **' + data.user.username + '**' + '\n\n' 
                            break
                    }
                }
            } else {
                description += '**Nothing in queue.**'
            }
        } catch (e) {
            await interaction.reply({
                content: 'Forever is not connected.',
                ephemeral: true
            })
            return;
        }

        const embed = new EmbedBuilder()
            .setTitle('Queue')
            .setThumbnail('https://raw.githubusercontent.com/PrideInt/Forever/readme/euphoriatear.gif')
            .setAuthor({
                name: 'Forever',
                iconURL: 'https://raw.githubusercontent.com/PrideInt/Forever/readme/euphoriatear.jpg'
            })
            .setDescription(description)

        await interaction.reply({
            embeds: [embed], ephemeral: true
        })
    }
}