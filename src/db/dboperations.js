//for connecting to the api
const axios = require('axios');
const { BOT_API_BASE_URL, APP_TOKEN } = process.env;

//save the answer to the database
const saveAnswer = async (answer) => {
	console.log('inside the saveanswer function');
	console.log(answer);
	let res;

	try {
		// app token added for authorization
		res = await axios.post(`${BOT_API_BASE_URL}Answers/`, answer, {
			headers: {
				Authorization: `Bearer ${APP_TOKEN}`,
			},
		});
	} catch (error) {}

	console.log(`Status code: ${res.status}`);
	console.log(`Status text: ${res.statusText}`);
	console.log(`Request method: ${res.request.method}`);
	console.log(`Path: ${res.request.path}`);

	console.log(`Date: ${res.headers.date}`);
	console.log(`Data: ${res.data}`);
	return res;
};

const saveProjectStatus = async (projectStatus) => {
	console.log('inside the saveProjectStatus function');
	console.log(projectStatus);
	let res;

	// app token added for authorization
	try {
		res = await axios.post(`${BOT_API_BASE_URL}Projects/`, projectStatus, {
			headers: {
				Authorization: `Bearer ${APP_TOKEN}`,
			},
		});
	} catch (error) {
		console.log(error);
	}

	console.log(`Status code: ${res.status}`);
	console.log(`Status text: ${res.statusText}`);
	console.log(`Request method: ${res.request.method}`);
	console.log(`Path: ${res.request.path}`);

	console.log(`Date: ${res.headers.date}`);
	//console.log(`Data: ${res.data}`);
	return res;
};

module.exports = {
	saveAnswer: saveAnswer,
	saveProjectStatus: saveProjectStatus,
};
