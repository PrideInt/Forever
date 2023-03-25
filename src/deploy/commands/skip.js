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
            let choices = ['current', 'all']
            for (let i = 1; i < client.queue.get(interaction.guildId).length; i++) {
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
        const queue = client.queue.get(interaction.guildId)
        const position = interaction.options.getString("position")

        let data

        if (position === 'current') {
            data = queue.get(0)

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
        } else if (position === 'all') {
            queue.clear()
            data = queue.get(position)

            const embed = new EmbedBuilder()
                .setTitle('Skipping all...')
                .setThumbnail('https://cdn.discordapp.com/attachments/944560551621709848/1048672072047546398/IMG_0838.gif')
                .setAuthor({
                    name: 'Forever',
                    iconURL: 'https://cdn.discordapp.com/attachments/944560551621709848/1038285032604827728/IMG_9412.jpg'
                })
            interaction.reply({
                embeds: [embed]
            })
            client.players.get(interaction.guildId).stop()
        } else {
            data = queue.get(position)

            const embed = new EmbedBuilder()
                .setTitle('Removing **' + data.title + '** from position ' + position + '.')
                .setThumbnail(data.thumbnail)
                .setAuthor({
                    name: interaction.user.username,
                    iconURL: interaction.user.displayAvatarURL()
                })
            await interaction.reply({
                embeds: [embed]
            })
            queue.remove(position)
        }
    }
}