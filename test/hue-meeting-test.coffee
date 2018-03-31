Helper = require('hubot-test-helper')
chai = require 'chai'
nock = require 'nock'

expect = chai.expect

helper = new Helper [
  '../src/hue-meeting.coffee'
]

describe 'hubot-hue-meeting', ->
  beforeEach ->
    process.env.PHILIPS_HUE_HASH='foobar'
    process.env.PHILIPS_HUE_IP='1.2.3.4'
    nock.disableNetConnect()
    @room = helper.createRoom()

  afterEach ->
    delete process.env.PHILIPS_HUE_HASH
    delete process.env.PHILIPS_HUE_IP
    nock.cleanAll()
    @room.destroy()

  # hubot meeting
  it 'sets the lights to meeting mode', (done) ->
    nock('http://1.2.3.4')
      .put('/api/foobar/groups/0/action')
      .replyWithFile(200, __dirname + '/fixtures/groups-0-action.json')

    selfRoom = @room
    selfRoom.user.say('alice', '@hubot meeting')
    setTimeout(() ->
      try
        expect(selfRoom.messages).to.eql [
          ['alice', '@hubot meeting']
          ['hubot', '@alice Setting lights to meeting mode ...']
          ['hubot', 'Done!']
        ]
        done()
      catch err
        done err
      return
    , 1000)

  # hubot free
  it 'sets the lights to free mode', (done) ->
    nock('http://1.2.3.4')
      .put('/api/foobar/groups/0/action')
      .replyWithFile(200, __dirname + '/fixtures/groups-0-action.json')

    selfRoom = @room
    selfRoom.user.say('alice', '@hubot free')
    setTimeout(() ->
      try
        expect(selfRoom.messages).to.eql [
          ['alice', '@hubot free']
          ['hubot', '@alice Setting lights back to white ...']
          ['hubot', 'Done!']
        ]
        done()
      catch err
        done err
      return
    , 1000)

  # hubot disco
  it 'sets the lights to disco mode', (done) ->
    nock('http://1.2.3.4')
      .put('/api/foobar/groups/0/action')
      .replyWithFile(200, __dirname + '/fixtures/groups-0-action.json')

    selfRoom = @room
    selfRoom.user.say('alice', '@hubot disco on')
    setTimeout(() ->
      try
        expect(selfRoom.messages).to.eql [
          ['alice', '@hubot disco on']
          ['hubot', '@alice Setting lights to party mode ...']
          ['hubot', ':tada: Party mode activated! :tada:']
        ]
        done()
      catch err
        done err
      return
    , 1000)

  # hubot disco
  it 'sets the lights to normal mode', (done) ->
    nock('http://1.2.3.4')
      .put('/api/foobar/groups/0/action')
      .replyWithFile(200, __dirname + '/fixtures/groups-0-action.json')

    selfRoom = @room
    selfRoom.user.say('alice', '@hubot disco off')
    setTimeout(() ->
      try
        expect(selfRoom.messages).to.eql [
          ['alice', '@hubot disco off']
          ['hubot', '@alice Getting back to work now.']
        ]
        done()
      catch err
        done err
      return
    , 1000)

  # connection failure
  it 'simulated connection failure', (done) ->
    nock('http://1.2.3.4')
      .put('/api/foobar/groups/0/action')
      .replyWithError({code: 'ETIMEDOUT'})

    selfRoom = @room
    selfRoom.user.say('alice', '@hubot meeting')
    setTimeout(() ->
      try
        expect(selfRoom.messages).to.eql [
          ['alice', '@hubot meeting']
          ['hubot', '@alice Setting lights to meeting mode ...']
          ['hubot', 'Connection timed out to Hue bridge.']
        ]
        done()
      catch err
        done err
      return
    , 1000)

  # bad credentials
  it 'simulated bad credentials', (done) ->
    nock('http://1.2.3.4')
      .put('/api/foobar/groups/0/action')
      .replyWithFile(200, __dirname + '/fixtures/unauthorized-user.json')

    selfRoom = @room
    selfRoom.user.say('alice', '@hubot meeting')
    setTimeout(() ->
      try
        expect(selfRoom.messages).to.eql [
          ['alice', '@hubot meeting']
          ['hubot', '@alice Setting lights to meeting mode ...']
          ['hubot', 'An error ocurred: Api Error: unauthorized user']
        ]
        done()
      catch err
        done err
      return
    , 1000)
