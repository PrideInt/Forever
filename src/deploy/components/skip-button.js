const { EmbedBuilder } = require('discord.js')

module.exports = {
    data: {
        name: 'skip-b'
    },
    async execute(interaction, client) {
        if (interaction.channel != client.audioChannels.get(interaction.guildId)) {
            await interaction.reply({
                content: 'You must use commands in **' + client.audioChannels.get(interaction.guildId).name + '**.', ephemeral: true
            })
            return;
        } else if (client.queue.get(interaction.guildId).isEmpty) {
            await interaction.reply({
                content: 'No tracks to skip.', ephemeral: true
            })
            return;
        }
        const data = client.queue.get(interaction.guildId).get(0)

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
        client.players.get(interaction.guildId).stop()
    }
}