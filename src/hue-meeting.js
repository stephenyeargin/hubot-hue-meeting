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

const hue = require('node-hue-api').v3;

const {
  LightState,
} = hue.lightStates;

module.exports = (robot) => {
  const baseUrl = process.env.PHILIPS_HUE_IP;
  const hash = process.env.PHILIPS_HUE_HASH;
  const meetingBrightness = process.env.PHILIPS_HUE_MEETING_BRI || 254;
  const meetingHue = process.env.PHILIPS_HUE_MEETING_HUE || 6144;
  const meetingSaturation = process.env.PHILIPS_HUE_MEETING_SAT || 254;
  const guestBrightness = process.env.PHILIPS_HUE_GUEST_BRI || 254;
  const guestHue = process.env.PHILIPS_HUE_GUEST_HUE || 47125;
  const guestSaturation = process.env.PHILIPS_HUE_GUEST_SAT || 254;
  const freeBrightness = process.env.PHILIPS_HUE_FREE_BRI || 254;
  const freeHue = process.env.PHILIPS_HUE_FREE_HUE || 0;
  const freeSaturation = process.env.PHILIPS_HUE_FREE_SAT || 0;

  // Connect based on provided string
  const getClient = () => hue.api.createLocal(baseUrl).connect(hash);

  // Define the various colors and modes
  const meetingColor = new LightState().on(true).hue(meetingHue).sat(meetingSaturation)
    .bri(meetingBrightness)
    .alert('select')
    .effect('none');
  const guestColor = new LightState().on(true).hue(guestHue).sat(guestSaturation)
    .bri(guestBrightness)
    .alert('select')
    .effect('none');
  const freeColor = new LightState().on(true).hue(freeHue).sat(freeSaturation)
    .bri(freeBrightness)
    .alert('none')
    .effect('none');
  const partyMode = new LightState().sat(254).bri(254).effect('colorloop')
    .alert('lselect');

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
    const hueApi = getClient();
    res.reply('Setting lights to meeting mode ...');
    robot.logger.debug('Connecting ...');
    return hueApi.then((api) => api.groups.setGroupState(0, meetingColor)).then((status) => {
      robot.logger.debug(status);
      res.send('Done!');
    }).catch((err) => handleError(res, err));
  });

  robot.respond(/(guest|guests)$/i, (res) => {
    const hueApi = getClient();
    res.reply('Setting lights to guest mode ...');
    return hueApi.then((api) => api.groups.setGroupState(0, guestColor)).then((status) => {
      robot.logger.debug(status);
      res.send('Done!');
    }).catch((err) => handleError(res, err));
  });

  robot.respond(/free$/i, (res) => {
    const hueApi = getClient();
    res.reply('Setting lights back to free ...');
    return hueApi.then((api) => api.groups.setGroupState(0, freeColor)).then((status) => {
      robot.logger.debug(status);
      res.send('Done!');
    }).catch((err) => handleError(res, err));
  });

  robot.respond(/(?:disco|party) (on|off)$/i, (res) => {
    const hueApi = getClient();
    const loopStatus = res.match[1];
    if (loopStatus === 'on') {
      res.reply('Setting lights to party mode ...');
      return hueApi.then((api) => api.groups.setGroupState('0', partyMode)).then((status) => {
        robot.logger.debug(status);
        res.send(':tada: Party mode activated! :tada:');
      }).catch((err) => handleError(res, err));
    }
    res.reply('Getting back to work now.');
    return hueApi.then((api) => api.groups.setGroupState('0', freeColor)).then((status) => robot.logger.debug(status)).catch((err) => handleError(res, err));
  });
};
