const googleSpreadsheet = require('../db/googleSpreadsheet');
const dboperations = require('../db/dboperations');
//slack api
const { SLACK_BASE_URL, SLACK_BOT_TOKEN } = process.env;
const axios = require('axios');

const respond = async (payload, respond) => {
	//set variables
	let answerValue = payload.actions[0].value;
	let userName = payload.user.name; // we will rewrite this
	let userId = payload.user.id;
	let channelId = payload.channel.id;
	let text;
	let longAnswer;
	let question = 'Mood';
	let userEmail = '';

	//call slack api to get user info
	try {
		const response = await axios.get(
			`${SLACK_BASE_URL}users.info?token=${SLACK_BOT_TOKEN}&user=${userId}`
		);
		const rawUserList = response.data;
		userEmail = response.data.user.profile.email;
		userName = response.data.user.profile.real_name;
	} catch (error) {
		console.log(error);
	}
	//log to keep track
	console.log(`reacting to mood question: ${answerValue} for user ${userName}`);

	//block of automatic response
	let block = [
		{
			type: 'section',
			text: {
				type: 'mrkdwn',
				text: 'Thanks for your honest answer :female-astronaut:',
			},
		},
	];

	//replace the block with automatic response
	respond({
		blocks: block,
		replace_original: true,
	});

	//save to spreadsheet
	saveToSpreadsheet(userId, userName, answerValue, channelId);
	//save to the database
	saveToDatabase(question, answerValue, userName, userEmail, userId);
};

async function saveToSpreadsheet(userId, userName, answerValue, channelId) {
	console.log('Should update the excel file');
	//update the spreadsheet
	let date = new Date().toLocaleDateString();
	let newArray = [[userName, date, answerValue]];
	googleSpreadsheet.updateMoodSheet(newArray);
}

const saveToDatabase = async (
	question,
	answerValue,
	userName,
	userEmail,
	userId
) => {
	console.log('going to save to the database');
	const date = new Date();

	//Table structure
	const answer = {
		Question: question,
		Answer: answerValue,
		Date: date,
		Time: date,
		EmployeeName: userName,
		EmployeeEmail: userEmail,
		SlackId: userId,
	};

	dboperations.saveAnswer(answer);
};

module.exports.respond = respond;
