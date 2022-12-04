const { createAudioResource } = require('@discordjs/voice')
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js')

module.exports = {
    name: 'skip',
    data: 
    
    new SlashCommandBuilder()
        .setName('skip')
        .setDescription('Skips the next track on queue, if any.')
        .addStringOption(position => 
            position
                .setName("position")
                .setDescription("Position of track on queue.")
                .setAutocomplete(true)
                .setRequired(true)),

    async autocomplete(interaction, client) {
        const focused = interaction.options.getFocused(true)

        if (focused.name === 'position') {
            let choices = ['current']
            for (let i = 1; i < client.queue.length; i++) {
                choices.push(i + '')
            }
            const filtered = choices.filter(choice => choice.startsWith(focused.value))

            await interaction.respond(filtered.map(choice => ({
                name: choice,
                value: choice
            })))
        }
    },

    async execute(interaction, client) {
        if (interaction.channel != client.audioChannel) {
            await interaction.reply('You must use commands in **' + client.audioChannel.name + '**.')
            return;
        } else if (client.queue.isEmpty) {
            await interaction.reply('No tracks to skip.')
            return;
        }
        const position = interaction.options.getString("position")

        let data

        if (position === 'current') {
            data = client.queue.get(0)

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
        } else {
            data = client.queue.get(position)
            await interaction.reply('Removing **' + data.title + '** from position ' + position + '.')

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
            client.queue.remove(position)
        }
    }
}