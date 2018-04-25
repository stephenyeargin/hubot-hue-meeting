# Hubot Hue Meeting

[![npm version](https://badge.fury.io/js/hubot-hue-meeting.svg)](http://badge.fury.io/js/hubot-hue-meeting) [![Build Status](https://travis-ci.org/stephenyeargin/hubot-hue-meeting.png)](https://travis-ci.org/stephenyeargin/hubot-hue-meeting)

Control your Hue lights to let people know you're on a call.

See [`src/hue-meeting.coffee`](src/hue-meeting.coffee) for full documentation.

## Installation

In hubot project repo, run:

`npm install hubot-hue-meeting --save`

Then add **hubot-hue-meeting** to your `external-scripts.json`:

```json
[
  "hubot-hue-meeting"
]
```

## Configuration

For instructions on obtaining the `PHILIPS_HUE_HASH`, see the [Developer Documentation](http://www.developers.meethue.com/philips-hue-api). The default colors are orange for meeting mode, white for free mode.

| Environment Variable  | Required? | Description                              |
| --------------------- | :-------: | ---------------------------------------- |
| `PHILIPS_HUE_HASH`    | Yes       | The token for your bridge user           |
| `PHILIPS_HUE_IP`      | Yes       | The IP or hostname of your Hue bridge    |
| `PHILIPS_HUE_MEETING_BRI` | No | Meeting mode brightness; Default: 255       |
| `PHILIPS_HUE_MEETING_HUE` | No | Meeting mode color hue; Default: 6144       |
| `PHILIPS_HUE_MEETING_SAT` | No | Meeting mode color saturation; Default: 255 |
| `PHILIPS_HUE_GUEST_BRI`   | No | Guest mode brightness; Default: 254         |
| `PHILIPS_HUE_GUEST_HUE`   | No | Guest mode color hue; Default: 47125        |
| `PHILIPS_HUE_GUEST_SAT`   | No | Guest mode color saturation; Default: 254   |
| `PHILIPS_HUE_FREE_BRI`    | No | Free mode brightness; Default: 255          |
| `PHILIPS_HUE_FREE_HUE`    | No | Free mode color hue; Default: 0             |
| `PHILIPS_HUE_FREE_SAT`    | No | Free mode color saturation; Default: 0      |

## Sample Interaction

```
user> hubot meeting
hubot> Setting lights to meeting mode ...

user> hubot guest
hubot> Setting lights back to guest mode ...
hubot> Done!

user> hubot free
hubot> Setting lights back to free ...
hubot> Done!

user> hubot disco on
hubot> :tada: Party mode activated! :tada:

user> hubot disco off
hubot> Getting back to work now.
```
