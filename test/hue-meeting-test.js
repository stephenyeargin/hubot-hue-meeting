const {
  describe, it, beforeEach, afterEach,
} = require('node:test');
const assert = require('node:assert/strict');
const nock = require('nock');
const { createTestBot } = require('./common/TestBot');

// Helper: send one message and collect the next N events across 'reply' and 'send'
// Returns { replies: [...], sends: [...] } after waiting for the expected count.
function collectResponses(bot, message, { replyCount = 0, sendCount = 0 }) {
  return new Promise((resolve) => {
    const replies = [];
    const sends = [];

    const check = () => {
      if (replies.length >= replyCount && sends.length >= sendCount) {
        resolve({ replies, sends });
      }
    };

    if (replyCount > 0) {
      bot.robot.adapter.on('reply', function onReply(_, strings) {
        replies.push(strings[0]);
        check();
        if (replies.length >= replyCount) {
          bot.robot.adapter.removeListener('reply', onReply);
        }
      });
    }

    if (sendCount > 0) {
      bot.robot.adapter.on('send', function onSend(_, strings) {
        sends.push(strings[0]);
        check();
        if (sends.length >= sendCount) {
          bot.robot.adapter.removeListener('send', onSend);
        }
      });
    }

    // If nothing to wait for, resolve immediately after send
    if (replyCount === 0 && sendCount === 0) {
      bot.send(message).then(resolve);
      return;
    }

    bot.send(message);
  });
}

describe('hubot-hue-meeting', () => {
  let bot;

  beforeEach(async () => {
    bot = await createTestBot();
  });

  afterEach(() => {
    bot.shutdown();
  });

  it('sets the lights to meeting mode', async () => {
    nock('https://1.2.3.4')
      .put('/api/foobar/groups/0/action')
      .replyWithFile(200, `${__dirname}/fixtures/groups-0-action.json`);

    const { replies, sends } = await collectResponses(bot, '@hubot meeting', { replyCount: 1, sendCount: 1 });
    assert.equal(replies[0], 'Setting lights to meeting mode ...');
    assert.equal(sends[0], 'Done!');
  });

  it('sets the lights to guest mode', async () => {
    nock('https://1.2.3.4')
      .put('/api/foobar/groups/0/action')
      .replyWithFile(200, `${__dirname}/fixtures/groups-0-action.json`);

    const { replies, sends } = await collectResponses(bot, '@hubot guest', { replyCount: 1, sendCount: 1 });
    assert.equal(replies[0], 'Setting lights to guest mode ...');
    assert.equal(sends[0], 'Done!');
  });

  it('sets the lights to free mode', async () => {
    nock('https://1.2.3.4')
      .put('/api/foobar/groups/0/action')
      .replyWithFile(200, `${__dirname}/fixtures/groups-0-action.json`);

    const { replies, sends } = await collectResponses(bot, '@hubot free', { replyCount: 1, sendCount: 1 });
    assert.equal(replies[0], 'Setting lights back to free ...');
    assert.equal(sends[0], 'Done!');
  });

  it('sets the lights to disco mode', async () => {
    nock('https://1.2.3.4')
      .put('/api/foobar/groups/0/action')
      .replyWithFile(200, `${__dirname}/fixtures/groups-0-action.json`);

    const { replies, sends } = await collectResponses(bot, '@hubot disco on', { replyCount: 1, sendCount: 1 });
    assert.equal(replies[0], 'Setting lights to party mode ...');
    assert.equal(sends[0], ':tada: Party mode activated! :tada:');
  });

  it('sets the lights to normal mode', async () => {
    nock('https://1.2.3.4')
      .put('/api/foobar/groups/0/action')
      .replyWithFile(200, `${__dirname}/fixtures/groups-0-action.json`);

    const { replies } = await collectResponses(bot, '@hubot disco off', { replyCount: 1 });
    assert.equal(replies[0], 'Getting back to work now.');
  });
});

describe('hubot-hue-meeting errors', () => {
  let bot;

  beforeEach(async () => {
    bot = await createTestBot();
  });

  afterEach(() => {
    bot.shutdown();
  });

  it('simulated connection failure', async () => {
    nock('https://1.2.3.4')
      .put('/api/foobar/groups/0/action')
      .replyWithError({ code: 'ETIMEDOUT' });

    const { replies, sends } = await collectResponses(bot, '@hubot meeting', { replyCount: 1, sendCount: 1 });
    assert.equal(replies[0], 'Setting lights to meeting mode ...');
    assert.equal(sends[0], 'Connection timed out to Hue bridge.');
  });

  it('simulated bad credentials', async () => {
    nock('https://1.2.3.4')
      .put('/api/foobar/groups/0/action')
      .replyWithFile(200, `${__dirname}/fixtures/unauthorized-user.json`);

    const { replies, sends } = await collectResponses(bot, '@hubot meeting', { replyCount: 1, sendCount: 1 });
    assert.equal(replies[0], 'Setting lights to meeting mode ...');
    assert.equal(sends[0], 'An error ocurred: Error: unauthorized user');
  });
});
