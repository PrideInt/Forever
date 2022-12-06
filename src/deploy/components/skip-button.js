const { EmbedBuilder } = require('discord.js')

module.exports = {
    data: {
        name: 'skip-b'
    },
    async execute(interaction, client) {
        if (interaction.channel != client.audioChannel) {
            await interaction.reply({
                content: 'You must use commands in **' + client.audioChannel.name + '**.', ephemeral: true
            })
            return;
        } else if (client.queue.isEmpty) {
            await interaction.reply({
                content: 'No tracks to skip.', ephemeral: true
            })
            return;
        }
        const data = client.queue.get(0)

        const embed = new EmbedBuilder()
            .setTitle('Skipping **' + data.title + '**.')
            .setThumbnail(data.thumbnail)
            .setAuthor({
                name: interaction.user.username,
                iconURL: interaction.user.displayAvatarURL()
            })

        interaction.reply({
            embeds: [embed]
        })
        client.player.stop()
    }
}