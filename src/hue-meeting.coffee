# Description
#   Control your Hue lights for meeting mode.
#
# Configuration:
#   PHILIPS_HUE_HASH - Secret hash for your user
#   PHILIPS_HUE_IP - IP or hostname of your Hue bridge
#
# Commands:
#   hubot meeting - Activate meeting mode
#   hubot free - End meeting mode
#   hubot disco - Have a bit of fun with the lights
#
# Author:
#   Stephen Yeargin <stephen.yeargin@gmail.com>

hue = require('node-hue-api')
HueApi = hue.HueApi
lightState = hue.lightState

module.exports = (robot) ->
  base_url = process.env.PHILIPS_HUE_IP
  hash  = process.env.PHILIPS_HUE_HASH
  api = new HueApi(base_url, hash)
  state = lightState.create()

  # Define the various colors and modes
  meetingColor = lightState.create().on(true).hue(6144).sat(255).bri(255)
  freeColor = lightState.create().on(true).hue(0).sat(0).bri(255)
  partyMode = lightState.create().sat(255).effect('colorloop').alert('lselect')
  backToWork = lightState.create().sat(0).effect('none').alert('none')

  robot.respond /meeting$/i, (res) ->
    res.reply "Setting lights to meeting mode ..."
    api.setGroupLightState '0', meetingColor, (err, status) ->
      return handleError res, err if err
      robot.logger.debug status

  robot.respond /free$/i, (res) ->
    res.reply "Setting lights back to white ..."
    api.setGroupLightState '0', freeColor, (err, status) ->
      return handleError res, err if err
      robot.logger.debug status

  robot.respond /(?:disco|party) (on|off)$/i, (res) ->
    loop_status = res.match[1]
    if loop_status == 'on'
      res.reply ":tada: Party mode activated! :tada:"
      api.setGroupLightState '0', partyMode, (err, status) ->
        return handleError res, err if err
        robot.logger.debug status
    else
      res.reply 'Getting back to work now.'
      api.setGroupLightState '0', backToWork, (err, status) ->
        return handleError res, err if err
        robot.logger.debug status

  handleError = (res, err) ->
    robot.logger.error err
    res.send err
