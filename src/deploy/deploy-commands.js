/*
const { SlashCommandBuilder } = require('@discordjs/builders');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');

const comms = [
    new SlashCommandBuilder().setName('hello').setDefaultPermission('Hello world!')
].map(command => command.toJSON());

const rest = new REST({ version: '9' }).setToken(token);

rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands })
	.then(() => console.log('Successfully registered application commands.'))
	.catch(console.error);
*/

const { REST } = require('@discordjs/rest')
const { Routes } = require('discord-api-types/v9')
const fs = require('fs')

const { token, appid, guildid } = process.env

module.exports = (client) => {
	client.handleCommands = async() => {
		const folder = fs.readdirSync("./src/deploy/commands")
		const {commands, commandArr} = client

		for (const file of folder) {
			const command = require(`./commands/${file}`)

			commands.set(command.data.name, command)
			commandArr.push(command.data.toJSON())
			console.log(`Command: ${command.data.name} has been passed`)
		}

		const rest = new REST({
			version: '10'
		}).setToken(token)

		try {
			console.log('Started refreshing application (/) commands.')

			await rest.put(Routes.applicationCommands(appid), {
				body: commandArr,
			})
			console.log('Successfully refreshed application (/) commands.')
		} catch (e) {
			console.error(e)
		}
	}
}