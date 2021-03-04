const { google } = require('googleapis');
const keys = require('../keys/gdrive_keys.json');

// SCOPES
// https://developers.google.com/identity/protocols/googlescopes
const client = new google.auth.JWT(keys.client_email, null, keys.private_key, [
	'https://www.googleapis.com/auth/spreadsheets',
]);

//Exported function
function updateHomeOfficeSheet(newDataArray) {
	//authorize
	client.authorize(function (err, tokens) {
		if (err) {
			console.log(err);
			return;
		} else {
			console.log('Connected to gdrive');
			gsrun(client, newDataArray);
		}
	});

	async function gsrun(clientInfo, newDataArray) {
		//set up the spreadsheet info
		const gsapi = google.sheets({
			version: 'v4',
			auth: clientInfo,
		});

		//set up the spreadsheet for updating it
		const updateOptions = {
			spreadsheetId: '1xr9P_C_eJXbuY7pGNbCajnqzCGdZkHmc43kPW8zyQ10',
			range: 'A1',
			valueInputOption: 'USER_ENTERED',
			resource: {
				values: newDataArray,
			},
		};

		let res = await gsapi.spreadsheets.values.append(updateOptions);
	}
}

//Exported function
function updateMoodSheet(newDataArray) {
	//authorize
	client.authorize(function (err, tokens) {
		if (err) {
			console.log(err);
			return;
		} else {
			console.log('Connected to gdrive');
			gsrun(client, newDataArray);
		}
	});

	async function gsrun(clientInfo, newDataArray) {
		//set up the spreadsheet info
		const gsapi = google.sheets({
			version: 'v4',
			auth: clientInfo,
		});

		//set up the spreadsheet for updating it
		const updateOptions = {
			spreadsheetId: '1xr9P_C_eJXbuY7pGNbCajnqzCGdZkHmc43kPW8zyQ10',
			range: 'Mood question!A1',
			valueInputOption: 'USER_ENTERED',
			resource: {
				values: newDataArray,
			},
		};

		let res = await gsapi.spreadsheets.values.append(updateOptions);
	}
}

module.exports.updateHomeOfficeSheet = updateHomeOfficeSheet;
module.exports.updateMoodSheet = updateMoodSheet;
