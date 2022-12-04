const { readdirSync } = require('fs')

module.exports = (client) => {
    client.handleComponents = async () => {
        const folder = readdirSync("./src/deploy/components")
        const {buttons} = client

		for (const file of folder) {
			const component = require(`./components/${file}`)

			buttons.set(component.data.name, component)
		}
    }
}