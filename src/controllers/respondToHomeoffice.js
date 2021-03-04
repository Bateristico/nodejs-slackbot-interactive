//slack api
const axios = require('axios');
const { SLACK_BASE_URL, SLACK_BOT_TOKEN } = process.env;

const { WebClient } = require('@slack/web-api'); //posting messages
const web = new WebClient(SLACK_BOT_TOKEN);
const googleSpreadsheet = require('../db/googleSpreadsheet');
const dboperations = require('../db/dboperations');

const respond = async (payload, respond) => {
	//set variables
	let answerValue = payload.actions[0].value;
	let userName = payload.user.name;
	let userId = payload.user.id;
	let channelId = payload.channel.id;
	let text;
	let longAnswer;
	let question = 'Homeoffice';
	let userEmail = '';

	console.log(
		`reacting to office answer ${answerValue} for user ${userName} in channel ${channelId}`
	);

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

	if (answerValue === 'home') {
		text = 'Thanks for your answer, have a productive day at home ✌️';
		longAnswer = 'Home';
	} else {
		text = 'Thanks for your answer, we will be glad to have you here ✌️';
		longAnswer = 'Office';
	}

	//block returned after the user answer the question
	let block = [
		{
			type: 'section',
			text: {
				type: 'mrkdwn',
				text: text,
			},
		},
	];

	respond({
		blocks: block,
		replace_original: true,
	});

	//save to spreadsheet (long answer has capital letters in the answer)
	saveToSpreadsheet(userId, userName, longAnswer, channelId);
	//save to the database
	saveToDatabase(question, answerValue, userName, userEmail, userId);
};

async function saveToSpreadsheet(userId, userName, longAnswer, channelId) {
	console.log('Should update the excel file');
	//update the spreadsheet
	const today = new Date();
	let tomorrow = new Date(today);
	const dayNumber = tomorrow.getDay();
	//if its friday
	if (dayNumber === 5) {
		tomorrow.setDate(tomorrow.getDate() + 3);
	} else {
		tomorrow.setDate(tomorrow.getDate() + 1);
	}

	let newArray = [[userName, tomorrow.toLocaleDateString('en-GB'), longAnswer]];
	googleSpreadsheet.updateHomeOfficeSheet(newArray);
}

const saveToDatabase = async (
	question,
	answerValue,
	userName,
	userEmail,
	userId
) => {
	console.log('going to save to the database');
	//const date = new Date();
	const today = new Date();
	let tomorrow = new Date(today);
	const dayNumber = tomorrow.getDay();
	//if its friday
	if (dayNumber === 5) {
		tomorrow.setDate(tomorrow.getDate() + 3);
	} else {
		tomorrow.setDate(tomorrow.getDate() + 1);
	}

	//Table structure
	const answer = {
		Question: question,
		Answer: answerValue,
		Date: tomorrow,
		Time: tomorrow,
		EmployeeName: userName,
		EmployeeEmail: userEmail,
		SlackId: userId,
	};
	//console.log(answer);
	dboperations.saveAnswer(answer);
};

module.exports.respond = respond;
