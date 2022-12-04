const fs = require('fs')

module.exports = (client) => {
    client.handleEvents = async() => {
        const folder = fs.readdirSync('./src/deploy/events')

        for (const file of folder) {
            const event = require(`./events/${file}`)

            if (event.once) {
                client.once(event.name, (...args) => event.execute(...args, client))
            } else {
                client.on(event.name, (...args) => event.execute(...args, client))
            }
        }
    }
}