// Description:
//   Control your Hue lights to let people know you're on a call.
//
// Configuration:
//   PHILIPS_HUE_HASH - Secret hash for your user
//   PHILIPS_HUE_IP - IP or hostname of your Hue bridge
//   PHILIPS_HUE_MEETING_BRI - Brightness value for meeting mode
//   PHILIPS_HUE_MEETING_HUE - Hue value for meeting mode
//   PHILIPS_HUE_MEETING_SAT - Saturation value for meeting mode
//   PHILIPS_HUE_GUEST_BRI - Brightness value for guest mode
//   PHILIPS_HUE_GUEST_HUE - Hue value for guest mode
//   PHILIPS_HUE_GUEST_SAT - Saturation value for guest mode
//   PHILIPS_HUE_FREE_BRI - Brightness value for free mode
//   PHILIPS_HUE_FREE_HUE - Hue value for free mode
//   PHILIPS_HUE_FREE_SAT - Saturation value for free mode
//
// Commands:
//   hubot meeting - Activate meeting mode
//   hubot guest - Activate guest mode
//   hubot free - End meeting mode
//   hubot disco <on|off> - Have a bit of fun with the lights
//
// Author:
//   stephenyeargin

const https = require('https');

const REQUEST_TIMEOUT_MS = 20 * 1000;

const toHueNumber = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? fallback : parsed;
};

const createHueClient = (bridgeHost, username) => {
  const host = bridgeHost.replace(/^https?:\/\//i, '').replace(/\/$/, '');
  const agent = new https.Agent({
    rejectUnauthorized: false,
  });

  const request = (path, payload) => new Promise((resolve, reject) => {
    const body = JSON.stringify(payload);
    const req = https.request({
      hostname: host,
      port: 443,
      method: 'PUT',
      path,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
      },
      agent,
    }, (response) => {
      const responseChunks = [];

      response.on('data', (chunk) => responseChunks.push(chunk));
      response.on('end', () => {
        const rawResponse = Buffer.concat(responseChunks).toString('utf8');
        let parsedResponse = [];

        if (response.statusCode && response.statusCode >= 400) {
          reject(new Error(`HTTP ${response.statusCode}`));
          return;
        }

        if (rawResponse.length > 0) {
          try {
            parsedResponse = JSON.parse(rawResponse);
          } catch (parseError) {
            reject(parseError);
            return;
          }
        }

        const hueError = Array.isArray(parsedResponse)
          ? parsedResponse.find((item) => item && item.error)
          : null;

        if (hueError && hueError.error && hueError.error.description) {
          reject(new Error(hueError.error.description));
          return;
        }

        resolve(parsedResponse);
      });
    });

    req.setTimeout(REQUEST_TIMEOUT_MS, () => {
      req.destroy(Object.assign(new Error('Request timed out'), { code: 'ETIMEDOUT' }));
    });

    req.on('error', (error) => reject(error));
    req.write(body);
    req.end();
  });

  return {
    setGroupState(groupId, state) {
      return request(`/api/${username}/groups/${groupId}/action`, state);
    },
  };
};

module.exports = (robot) => {
  const baseUrl = process.env.PHILIPS_HUE_IP;
  const hash = process.env.PHILIPS_HUE_HASH;
  const meetingBrightness = toHueNumber(process.env.PHILIPS_HUE_MEETING_BRI, 254);
  const meetingHue = toHueNumber(process.env.PHILIPS_HUE_MEETING_HUE, 6144);
  const meetingSaturation = toHueNumber(process.env.PHILIPS_HUE_MEETING_SAT, 254);
  const guestBrightness = toHueNumber(process.env.PHILIPS_HUE_GUEST_BRI, 254);
  const guestHue = toHueNumber(process.env.PHILIPS_HUE_GUEST_HUE, 47125);
  const guestSaturation = toHueNumber(process.env.PHILIPS_HUE_GUEST_SAT, 254);
  const freeBrightness = toHueNumber(process.env.PHILIPS_HUE_FREE_BRI, 254);
  const freeHue = toHueNumber(process.env.PHILIPS_HUE_FREE_HUE, 0);
  const freeSaturation = toHueNumber(process.env.PHILIPS_HUE_FREE_SAT, 0);

  const client = createHueClient(baseUrl, hash);

  // Define the various colors and modes
  const meetingColor = {
    on: true,
    hue: meetingHue,
    sat: meetingSaturation,
    bri: meetingBrightness,
    alert: 'select',
    effect: 'none',
  };
  const guestColor = {
    on: true,
    hue: guestHue,
    sat: guestSaturation,
    bri: guestBrightness,
    alert: 'select',
    effect: 'none',
  };
  const freeColor = {
    on: true,
    hue: freeHue,
    sat: freeSaturation,
    bri: freeBrightness,
    alert: 'none',
    effect: 'none',
  };
  const partyMode = {
    sat: 254,
    bri: 254,
    effect: 'colorloop',
    alert: 'lselect',
  };

  const handleError = (res, err) => {
    robot.logger.debug(err);
    switch (err.code) {
      case 'ETIMEDOUT':
        res.send('Connection timed out to Hue bridge.');
        break;
      default:
        res.send(`An error ocurred: ${err}`);
    }
  };

  robot.respond(/meeting$/i, (res) => {
    res.reply('Setting lights to meeting mode ...');
    return client.setGroupState(0, meetingColor).then((status) => {
      robot.logger.debug(status);
      res.send('Done!');
    }).catch((err) => handleError(res, err));
  });

  robot.respond(/(guest|guests)$/i, (res) => {
    res.reply('Setting lights to guest mode ...');
    return client.setGroupState(0, guestColor).then((status) => {
      robot.logger.debug(status);
      res.send('Done!');
    }).catch((err) => handleError(res, err));
  });

  robot.respond(/free$/i, (res) => {
    res.reply('Setting lights back to free ...');
    return client.setGroupState(0, freeColor).then((status) => {
      robot.logger.debug(status);
      res.send('Done!');
    }).catch((err) => handleError(res, err));
  });

  robot.respond(/(?:disco|party) (on|off)$/i, (res) => {
    const loopStatus = res.match[1];
    if (loopStatus === 'on') {
      res.reply('Setting lights to party mode ...');
      return client.setGroupState(0, partyMode).then((status) => {
        robot.logger.debug(status);
        res.send(':tada: Party mode activated! :tada:');
      }).catch((err) => handleError(res, err));
    }
    res.reply('Getting back to work now.');
    return client.setGroupState(0, freeColor)
      .then((status) => robot.logger.debug(status))
      .catch((err) => handleError(res, err));
  });
};
