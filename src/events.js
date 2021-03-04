//for listening to events
const { createEventAdapter } = require('@slack/events-api');
const slackSigningSecret = process.env.SLACK_SIGNING_SECRET;
const slackEvents = createEventAdapter(slackSigningSecret);

//for posting messages
const { WebClient } = require('@slack/web-api'); //posting messages
const { SLACK_BOT_TOKEN, SLACK_BASE_URL } = process.env;
const web = new WebClient(SLACK_BOT_TOKEN);
const eventsController = require('./controllers/respondToEvents');

//for connecting to the api
const axios = require('axios');

//exports the elements required as attachments in the slack message
const moodQuestion = require('./views/moodQuestion.json');
const homeOfficeQuestion = require('./views/homeofficeQuestion.json');
let modalQuestion = require('./views/modalQuestion.json');

//app listening for events
function listenForEvents(app) {
	app.use('/events', slackEvents.requestListener());

	/* the bot has to be subscribed to a list of events to actually listen to them */
	//mentions
	slackEvents.on('app_mention', async (event) => {
		console.log(
			`Received an app_mention event from user ${event.user} in channel ${event.channel}`
		);
		const args = event.text.split(' ');
		const command = args.splice(1, 1)[0];
		const userId = args.splice(0, 1)[0];

		console.log(`EVENT - userid is ${userId} and command is ${command}`);
		let attachments = 'none';

		//depending on the text next to the quote, klaudiabot responds something different
		switch (command.toLowerCase()) {
			case 'mood':
				attachments = moodQuestion;
				break;
			case 'homeoffice':
				attachments = homeOfficeQuestion;
				break;
			case 'modal':
				try {
					//adds the text property with the user name to the json
					modalQuestion.blocks[0].text.text = `:female-astronaut: Hello <@${event.user}>, thanks for calling me. Are you ready to update a project status?`;
					let mentionResponseBlock = {
						...modalQuestion,
						...{ channel: event.channel },
					}; //here
					const res = await web.chat.postMessage(mentionResponseBlock);
				} catch (error) {
					console.log(JSON.stringify(error));
				}
				break;
			case 'users':
				attachments = 'none';
				//call the slack api
				try {
					const res = await axios.get(
						`${SLACK_BASE_URL}users.list?token=${SLACK_BOT_TOKEN}&pretty=1`
					);
					console.log(res);
				} catch (error) {
					console.log(error);
				}
		}

		// in case it entered to one of the switch options
		if (attachments != 'none') {
			eventsController.respondToEvents(event.user, event.channel, attachments); // post message in slack using event controller
		}
	});

	//joins the channel
	slackEvents.on('member_joined_channel', (event) => {
		console.log(`User ${event.user} joined the channel ${event.channel}`);
	});

	//private message
	slackEvents.on('message', (event) => {
		console.log(
			`Received a direct message from user ${event.user} in channel ${event.channel}`
		);
	});

	// All errors in listeners are caught here. If this weren't caught, the program would terminate.
	slackEvents.on('error', (error) => {
		console.log(`error: ${error}`);
	});
}

module.exports.listenForEvents = listenForEvents;
