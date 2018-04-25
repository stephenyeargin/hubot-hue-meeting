# Description
#   Control your Hue lights to let people know you're on a call.
#
# Configuration:
#   PHILIPS_HUE_HASH - Secret hash for your user
#   PHILIPS_HUE_IP - IP or hostname of your Hue bridge
#   PHILIPS_HUE_MEETING_BRI - Brightness value for meeting mode
#   PHILIPS_HUE_MEETING_HUE - Hue value for meeting mode
#   PHILIPS_HUE_MEETING_SAT - Saturation value for meeting mode
#   PHILIPS_HUE_GUEST_BRI - Brightness value for guest mode
#   PHILIPS_HUE_GUEST_HUE - Hue value for guest mode
#   PHILIPS_HUE_GUEST_SAT - Saturation value for guest mode
#   PHILIPS_HUE_FREE_BRI - Brightness value for free mode
#   PHILIPS_HUE_FREE_HUE - Hue value for free mode
#   PHILIPS_HUE_FREE_SAT - Saturation value for free mode
#
# Commands:
#   hubot meeting - Activate meeting mode
#   hubot guest - Activate guest mode
#   hubot free - End meeting mode
#   hubot disco <on|off> - Have a bit of fun with the lights
#
# Author:
#   stephenyeargin

hue = require('node-hue-api')
HueApi = hue.HueApi
lightState = hue.lightState

module.exports = (robot) ->
  base_url = process.env.PHILIPS_HUE_IP
  hash  = process.env.PHILIPS_HUE_HASH
  meeting_bri = process.env.PHILIPS_HUE_MEETING_BRI or 254
  meeting_hue = process.env.PHILIPS_HUE_MEETING_HUE or 6144
  meeting_sat = process.env.PHILIPS_HUE_MEETING_SAT or 254
  guest_bri = process.env.PHILIPS_HUE_GUEST_BRI or 254
  guest_hue = process.env.PHILIPS_HUE_GUEST_HUE or 47125
  guest_sat = process.env.PHILIPS_HUE_GUEST_SAT or 254
  free_bri = process.env.PHILIPS_HUE_FREE_BRI or 255
  free_hue = process.env.PHILIPS_HUE_FREE_HUE or 0
  free_sat = process.env.PHILIPS_HUE_FREE_SAT or 0
  api = new HueApi(base_url, hash)
  state = lightState.create()

  # Define the various colors and modes
  meetingColor = lightState.create().on(true).hue(meeting_hue).sat(meeting_sat).bri(meeting_bri).alert('select').effect('none')
  guestColor = lightState.create().on(true).hue(guest_hue).sat(guest_sat).bri(guest_bri).alert('select').effect('none')
  freeColor = lightState.create().on(true).hue(free_hue).sat(free_sat).bri(free_bri).alert("none").effect('none')
  partyMode = lightState.create().sat(255).bri(255).effect('colorloop').alert('lselect')

  robot.respond /meeting$/i, (res) ->
    res.reply "Setting lights to meeting mode ..."
    api.setGroupLightState '0', meetingColor, (err, status) ->
      return handleError res, err if err
      robot.logger.debug status
      res.send 'Done!'

  robot.respond /(guest|guests)$/i, (res) ->
    res.reply "Setting lights to guest mode ..."
    api.setGroupLightState '0', guestColor, (err, status) ->
      return handleError res, err if err
      robot.logger.debug status
      res.send 'Done!'

  robot.respond /free$/i, (res) ->
    res.reply "Setting lights back to free ..."
    api.setGroupLightState '0', freeColor, (err, status) ->
      return handleError res, err if err
      robot.logger.debug status
      res.send 'Done!'

  robot.respond /(?:disco|party) (on|off)$/i, (res) ->
    loop_status = res.match[1]
    if loop_status == 'on'
      res.reply "Setting lights to party mode ..."
      api.setGroupLightState '0', partyMode, (err, status) ->
        return handleError res, err if err
        robot.logger.debug status
        res.send ':tada: Party mode activated! :tada:'
    else
      res.reply 'Getting back to work now.'
      api.setGroupLightState '0', freeColor, (err, status) ->
        return handleError res, err if err
        robot.logger.debug status

  handleError = (res, err) ->
    robot.logger.debug err
    switch err.code
      when 'ETIMEDOUT'
        res.send 'Connection timed out to Hue bridge.'
      else
        res.send "An error ocurred: #{err}"
