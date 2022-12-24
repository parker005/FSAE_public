const { token, guildId, clientId } = require('./config.json')
const { REST, SlashCommandBuilder, Routes } = require('discord.js')


const commands = [
    new SlashCommandBuilder().setName('yo').setDescription("replies hi"),
    new SlashCommandBuilder().setName('weekly').setDescription("lists events for the week")
]

    .map(command => command.toJSON());

const rest = new REST({ version: '10' }).setToken(token);

rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands})
    .then((data) => console.log(`Successfully registered ${data.length} application commands`))
    .catch(console.error)
