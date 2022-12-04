const { EmbedBuilder } = require('discord.js')

module.exports = {
    data: {
        name: 'skip-b'
    },
    async execute(interaction, client) {
        if (interaction.channel != client.audioChannel) {
            await interaction.reply('You must use commands in **' + client.audioChannel.name + '**.')
            return;
        } else if (client.queue.isEmpty) {
            await interaction.reply('No tracks to skip.')
            return;
        }
        const data = client.queue.dequeue()

        await interaction.reply('Skipping **' + data.title + '**.')

        const embed = new EmbedBuilder()
            .setTitle(data.title)
            .setThumbnail(data.thumbnail)
            .setAuthor({
                name: interaction.user.username,
                iconURL: interaction.user.displayAvatarURL()
            })
        client.audioChannel.send({
            embeds: [embed]
        })
        client.player.stop()
    }
}