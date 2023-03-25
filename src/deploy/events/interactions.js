module.exports = {
    name: "interactionCreate",
    async execute(interaction, client) {
        const {commands, buttons} = client
        const {commandName, customId} = interaction

        if (interaction.isChatInputCommand()) {
            const command = commands.get(commandName)

            if (!command) {
                return;
            }
            try {
                if (command.name === 'play' && client.cycle === 0) {
                    commands.get(commandName).handler({client, interaction})        
                    client.cycle++
                }
                try {
                    await command.execute(interaction, client)
                } catch (e) {
                    if (!client.audioChannels.has(interaction.guildId)) {
                        client.audioChannels.set(interaction.guildId, interaction.channel)
                        client.connections++
                    }
                    await command.execute(interaction, client)
                }
            } catch (e) {
                console.error(e)

                await interaction.reply({content: 'Something went wrong while executing the command.', ephemeral: true})
            }
        } else if (interaction.isAutocomplete()) {
            const command = commands.get(commandName);

            if (!command) {
                console.error(`No command matching ${interaction.commandName} was found.`);
                return;
            }
            try {
                await command.autocomplete(interaction, client);
            } catch (error) {
                console.error(error);
            }
        } else if (interaction.isButton()) {
            const button = buttons.get(customId)
            if (button.data.name === 'skip-b') {
                try {
                    await button.execute(interaction, client)
                } catch (e) {
                    console.log(e)
                }
            }
        }
    }
}