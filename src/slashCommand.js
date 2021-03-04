const bodyParser = require('body-parser');
const moodQuestion = require('./views/moodQuestion.json');
const homeOfficeQuestion = require('./views/homeofficeQuestion.json');
let modalQuestion = require('./views/modalQuestion.json');

module.exports.listenForCommands = async function (app) {
	app.use(
		bodyParser.urlencoded({
			extended: true,
		})
	);
	app.use(bodyParser.json());

	app.post('/commands', async (req, res) => {
		const { token, user_id, channel_id } = req.body;

		console.log(
			`Received a slash command from user ${user_id} in channel ${channel_id}`
		);

		//adds the text property with the user name to the json
		modalQuestion.blocks[0].text.text = `:female-astronaut: Hello <@${user_id}>, thanks for calling me. Are you ready to update a project status?`;

		if (token !== process.env.SLACK_VERIF_TOKEN) {
			console.log('Invalid token');
			return;
		}

		console.log('command : ' + req.body.command);
		let command = req.body.command;

		//return element that belongs to the command
		switch (command) {
			case '/klaudiabot-mood':
				res.status(200).send({
					attachments: [moodQuestion],
				});
				break;
			case '/klaudiabot-homeoffice':
				res.status(200).send({
					attachments: [homeOfficeQuestion],
				});
				break;
			case '/project-status':
				res.status(200).send({
					attachments: [modalQuestion],
				});
				break;
		}
	});
};
