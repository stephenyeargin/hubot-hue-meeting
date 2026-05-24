const path = require('path');
const { Robot, TextMessage } = require('hubot');
const nock = require('nock');
const script = require('../../src/hue-meeting');

class TestBotContext {
  constructor(robot, user) {
    this.robot = robot;
    this.user = user;
    this.sends = [];
    this.replies = [];
    this.robot.adapter.on('send', (_, strings) => this.sends.push(strings.join('\n')));
    this.robot.adapter.on('reply', (_, strings) => this.replies.push(strings.join('\n')));
    this.nock = nock;
  }

  async send(message) {
    const id = (Math.random() + 1).toString(36).substring(7);
    this.robot.adapter.receive(new TextMessage(this.user, message, id));
    await new Promise((done) => { setTimeout(done, 50); });
  }

  async sendAndWaitForResponse(message, responseType = 'send') {
    return new Promise((done) => {
      this.robot.adapter.once(responseType, (_, strings) => done(strings[0]));
      this.send(message);
    });
  }

  shutdown() {
    delete process.env.PHILIPS_HUE_IP;
    delete process.env.PHILIPS_HUE_HASH;
    delete process.env.PHILIPS_HUE_MEETING_HUE;
    delete process.env.PHILIPS_HUE_MEETING_SAT;
    delete process.env.PHILIPS_HUE_MEETING_BRI;
    delete process.env.PHILIPS_HUE_FREE_HUE;
    delete process.env.PHILIPS_HUE_FREE_SAT;
    delete process.env.PHILIPS_HUE_FREE_BRI;
    delete process.env.PHILIPS_HUE_GUEST_HUE;
    delete process.env.PHILIPS_HUE_GUEST_SAT;
    delete process.env.PHILIPS_HUE_GUEST_BRI;
    nock.cleanAll();
    this.robot.shutdown();
  }
}

async function createTestBot(settings = {}) {
  process.env.HUBOT_LOG_LEVEL = 'silent';
  process.env.PHILIPS_HUE_IP = '1.2.3.4';
  process.env.PHILIPS_HUE_HASH = 'foobar';
  process.env.PHILIPS_HUE_MEETING_HUE = '0';
  process.env.PHILIPS_HUE_MEETING_SAT = '254';
  process.env.PHILIPS_HUE_MEETING_BRI = '254';
  process.env.PHILIPS_HUE_FREE_HUE = '25500';
  process.env.PHILIPS_HUE_FREE_SAT = '254';
  process.env.PHILIPS_HUE_FREE_BRI = '254';
  process.env.PHILIPS_HUE_GUEST_HUE = '46920';
  process.env.PHILIPS_HUE_GUEST_SAT = '254';
  process.env.PHILIPS_HUE_GUEST_BRI = '254';
  nock.cleanAll();
  nock.disableNetConnect();
  const robot = new Robot(path.resolve(__dirname, 'adapter'), false, 'hubot');
  await robot.loadAdapter(path.resolve(__dirname, 'adapter.js'));
  script(robot);
  return new Promise((done) => {
    robot.adapter.on('connected', () => {
      if (settings.adapterName) robot.adapterName = settings.adapterName;
      const user = robot.brain.userForId('1', { name: 'testuser', room: '#testroom' });
      done(new TestBotContext(robot, user));
    });
    robot.run();
  });
}

module.exports = { createTestBot, TestBotContext };
