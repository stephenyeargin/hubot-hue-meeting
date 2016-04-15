chai = require 'chai'
sinon = require 'sinon'
chai.use require 'sinon-chai'

expect = chai.expect

describe 'hue-meeting', ->
  beforeEach ->
    @robot =
      respond: sinon.spy()
      hear: sinon.spy()

    require('../src/hue-meeting')(@robot)

  it 'registers a respond meeting listener', ->
    expect(@robot.respond).to.have.been.calledWith(/meeting$/i)

  it 'registers a respond free listener', ->
    expect(@robot.respond).to.have.been.calledWith(/free$/i)

  it 'registers a respond disco listener', ->
    expect(@robot.respond).to.have.been.calledWith(/(?:disco|party) (on|off)$/i)
