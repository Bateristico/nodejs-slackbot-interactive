const { createMessageAdapter } = require('@slack/interactive-messages');
const slackSigningSecret = process.env.SLACK_SIGNING_SECRET;
const { WebClient } = require('@slack/web-api');
const { SLACK_BOT_TOKEN, SLACK_BASE_URL } = process.env;
const web = new WebClient(SLACK_BOT_TOKEN);
const slackInteractions = createMessageAdapter(slackSigningSecret);

const eventsController = require('./controllers/respondToEvents');
const dboperations = require('./db/dboperations');

//json variables
const respondToMood = require('./controllers/respondToMood');
const respondToHomeOffice = require('./controllers/respondToHomeoffice');
const projectJsonModal = require('./views/projectJsonModal.json');

//for connecting to the api
const axios = require('axios');

module.exports.listenForInteractions = function (app) {
	app.use('/interactions', slackInteractions.requestListener());
};

//Triggered after the action of opening a modal
slackInteractions.action({ actionId: 'open_modal_button' }, async (payload) => {
	//check user
	let userName = payload.user.name;
	let slackUserId = payload.user.id;

	/*
  //call api and bring projects of that user

  // construct the projectJsonModal (dynamic projects)
  let projectOptions = {
      text: {
        type: "plain_text",
        text: "AAAA",
        emoji: true
      },
      value: "AAAA"
    };

    projectJsonModal2 = projectJsonModal2.blocks[1].element.options.push({ type: String, text: "hello"});
    //console.log(projectOptions)
    console.log(projectJsonModal2.blocks[1].element.options)
  */

	try {
		await web.views.open({
			trigger_id: payload.trigger_id,
			view: projectJsonModal,
		});
	} catch (e) {
		console.log(JSON.stringify(e));
	}

	// The return value is used to update the message where the action occurred immediately.
	// Use this to items like buttons and menus that you only want a user to interact with once.
	return {
		text: 'Processing...',
	};
});

//Triggered after the submission of a form
slackInteractions.viewSubmission(
	'ggs_project_modal_submit',
	async (payload) => {
		const slackId = payload.user.id;
		let userName = '';
		let userEmail = '';
		let projectStatus = {};
		const blockData = payload.view.state;

		//Set all the variables with the answers from the modal
		const projectName =
			blockData.values.ggs_project_selection_block.ggs_project_selection_element
				.selected_option.value;
		const stage =
			blockData.values.ggs_stage_selection_block.ggs_stage_selection_element
				.selected_option.value;
		const budget =
			blockData.values.ggs_budget_selection_block.ggs_budget_selection_element
				.selected_option.value;
		const timeline =
			blockData.values.ggs_timeline_selection_block
				.ggs_timeline_selection_element.selected_option.value;
		const percentage =
			blockData.values.ggs_scope_selection_block.ggs_scope_selection_element
				.selected_option.value;
		const risks =
			blockData.values.ggs_risks_selection_block.ggs_risks_selection_element
				.selected_option.value;
		const importantBusiness =
			blockData.values.ggs_important_business_block
				.ggs_important_business_element.value;
		const overallStatus =
			blockData.values.ggs_status_selection_block.ggs_status_selection_element
				.selected_option.value;

		//get name and user name through slack api
		//call slack api to get user info
		try {
			const response = await axios.get(
				`${SLACK_BASE_URL}users.info?token=${SLACK_BOT_TOKEN}&user=${slackId}`
			);
			userEmail = response.data.user.profile.email;
			userName = response.data.user.profile.real_name;
			//creates json for post insert through bot api
			const today = new Date();
			projectStatus = {
				ProjectName: projectName,
				Stage: stage,
				Budget: budget,
				TimeLine: timeline,
				Percentage: percentage,
				Risks: risks,
				ImportantBusiness: importantBusiness,
				OverallStatus: overallStatus,
				Date: new Date(),
				Time: new Date(),
				EmployeeName: userName,
				EmployeeEmail: userEmail,
				SlackId: slackId,
			};

			//calls the bot api and executes a post request
			try {
				const res = dboperations.saveProjectStatus(projectStatus);
				// post message back
				console.log(payload.user.id, payload.user.team_id);
				attachments = {
					text: `The status of the project ${projectName} has been submitted with date ${today
						.toISOString()
						.slice(0, 10)} :point_up:`,
				};
				// post message in slack using event controller
				eventsController.respondToEvents(
					payload.user.id,
					payload.user.id,
					attachments
				);
			} catch (error) {
				console.log(error);
			}

			//closes the modal after submision
			return {
				response_action: 'clear',
			};
		} catch (error) {
			console.log(error);
		}
	}
);

//interaction with buttons
slackInteractions.action(
	{
		type: 'button',
	},
	(payload, respond) => {
		let callbackId = payload.callback_id;

		console.log('inside the button interaction');
		console.log(payload);

		//determine the answer by the callback_id
		switch (callbackId) {
			case 'mood_answer':
				console.log('this is a mood answer');
				respondToMood.respond(payload, respond);
				break;
			case 'homeoffice_answer':
				console.log('this is a homeoffice answer');
				respondToHomeOffice.respond(payload, respond);
				break;
			default:
				//respondToButtons.respond(payload, respond);
				break;
		}
	}
);
