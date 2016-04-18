# hubot-hue-meeting

Control your Hue lights for meeting mode.

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

These two values must be set to interact with Hue bridge. For instructions on obtaining the `PHILIPS_HUE_HASH`, see the [Developer Documentation](http://www.developers.meethue.com/philips-hue-api).

```
export PHILIPS_HUE_HASH="secrets"
export PHILIPS_HUE_IP="xxx.xxx.xxx.xxx"
```
You can also configure the hue/sat/bri of the light for both free and meeting mode, the defaults are below.

```
export PHILIPS_HUE_MEETING_BRI=255
export PHILIPS_HUE_MEETING_HUE=6144
export PHILIPS_HUE_MEETING_SAT=255
export PHILIPS_HUE_FREE_BRI=255
export PHILIPS_HUE_FREE_HUE=0
export PHILIPS_HUE_FREE_SAT=0
```

## Sample Interaction

```
user> hubot meeting
hubot> Setting lights to meeting mode ...

user> hubot free
hubot> Setting lights back to white ...

user> hubot disco on
hubot> :tada: Party mode activated! :tada:

user> hubot disco off
hubot> Getting back to work now.
```
