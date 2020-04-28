const request = require('request');
const hook = "https://hooks.slack.com/services/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";

module.exports = {
  sendMessage: (req, res) => {
    const sender = req.body.sender
    const message = req.body.message;
    if (!message || !sender) {
      res.statusMessage = "Missing field (message or sender)"
      return res.sendStatus(400)
    }
    request.post(hook, {
        json: {
          blocks: [
            {
              type: "section",
              text: {
                type: "mrkdwn",
                text: `Feedback from *${sender}*:`
              }
            },
            {
              type: "section",
              text: {
                type: "mrkdwn",
                text: ">" + message.replace("\n", "\n>")
              }
            }
          ],
          text: `Feedback from ${sender}`
        }
      },
      (err, resp, body) => {
        if (err) res.sendStatus(500);
        else res.sendStatus(200);
      });
  }
};