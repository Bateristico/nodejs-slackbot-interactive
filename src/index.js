if (process.env.NODE_ENV !== 'production') {
	require('dotenv').config();
}
const express = require('express');
const port = process.env.PORT;
const app = express();

// listen for events route
const events = require('./events');
events.listenForEvents(app);

// listen for interactions route
const interactions = require('./interactions');
interactions.listenForInteractions(app);

// listen for slash commands route
const slashCommand = require('./slashCommand');
slashCommand.listenForCommands(app);

app.listen(port, function () {
	console.log(`bot is active and listening on ${port}`);
});

// Send availability response
app.use((req, res, next) => {
	res.status(200).json({ message: `Klaudiabot operative and running` });
	next();
});
