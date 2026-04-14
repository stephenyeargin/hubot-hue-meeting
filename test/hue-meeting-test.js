/* global describe beforeEach afterEach it */
/* eslint-disable func-names */
const Helper = require('hubot-test-helper');
const chai = require('chai');
const nock = require('nock');

const {
  expect,
} = chai;

const helper = new Helper([
  '../src/hue-meeting.js',
]);

describe('hubot-hue-meeting', () => {
  beforeEach(function () {
    process.env.PHILIPS_HUE_HASH = 'foobar';
    process.env.PHILIPS_HUE_IP = '1.2.3.4';
    nock.disableNetConnect();
    this.room = helper.createRoom();
  });

  afterEach(function () {
    delete process.env.PHILIPS_HUE_HASH;
    delete process.env.PHILIPS_HUE_IP;
    nock.cleanAll();
    this.room.destroy();
  });

  // hubot meeting
  it('sets the lights to meeting mode', function (done) {
    nock('https://1.2.3.4')
      .put('/api/foobar/groups/0/action')
      .replyWithFile(200, `${__dirname}/fixtures/groups-0-action.json`);

    const selfRoom = this.room;
    selfRoom.user.say('alice', '@hubot meeting');
    setTimeout(
      () => {
        try {
          expect(selfRoom.messages).to.eql([
            ['alice', '@hubot meeting'],
            ['hubot', '@alice Setting lights to meeting mode ...'],
            ['hubot', 'Done!'],
          ]);
          done();
        } catch (err) {
          done(err);
        }
      },
      100,
    );
  });

  // hubot guest
  it('sets the lights to guest mode', function (done) {
    nock('https://1.2.3.4')
      .put('/api/foobar/groups/0/action')
      .replyWithFile(200, `${__dirname}/fixtures/groups-0-action.json`);

    const selfRoom = this.room;
    selfRoom.user.say('alice', '@hubot guest');
    setTimeout(
      () => {
        try {
          expect(selfRoom.messages).to.eql([
            ['alice', '@hubot guest'],
            ['hubot', '@alice Setting lights to guest mode ...'],
            ['hubot', 'Done!'],
          ]);
          done();
        } catch (err) {
          done(err);
        }
      },
      100,
    );
  });

  // hubot free
  it('sets the lights to free mode', function (done) {
    nock('https://1.2.3.4')
      .put('/api/foobar/groups/0/action')
      .replyWithFile(200, `${__dirname}/fixtures/groups-0-action.json`);

    const selfRoom = this.room;
    selfRoom.user.say('alice', '@hubot free');
    setTimeout(
      () => {
        try {
          expect(selfRoom.messages).to.eql([
            ['alice', '@hubot free'],
            ['hubot', '@alice Setting lights back to free ...'],
            ['hubot', 'Done!'],
          ]);
          done();
        } catch (err) {
          done(err);
        }
      },
      100,
    );
  });

  // hubot disco
  it('sets the lights to disco mode', function (done) {
    nock('https://1.2.3.4')
      .put('/api/foobar/groups/0/action')
      .replyWithFile(200, `${__dirname}/fixtures/groups-0-action.json`);

    const selfRoom = this.room;
    selfRoom.user.say('alice', '@hubot disco on');
    setTimeout(
      () => {
        try {
          expect(selfRoom.messages).to.eql([
            ['alice', '@hubot disco on'],
            ['hubot', '@alice Setting lights to party mode ...'],
            ['hubot', ':tada: Party mode activated! :tada:'],
          ]);
          done();
        } catch (err) {
          done(err);
        }
      },
      100,
    );
  });

  // hubot disco
  it('sets the lights to normal mode', function (done) {
    nock('https://1.2.3.4')
      .put('/api/foobar/groups/0/action')
      .replyWithFile(200, `${__dirname}/fixtures/groups-0-action.json`);

    const selfRoom = this.room;
    selfRoom.user.say('alice', '@hubot disco off');
    setTimeout(
      () => {
        try {
          expect(selfRoom.messages).to.eql([
            ['alice', '@hubot disco off'],
            ['hubot', '@alice Getting back to work now.'],
          ]);
          done();
        } catch (err) {
          done(err);
        }
      },
      100,
    );
  });
});

describe('hubot-hue-meeting errors', () => {
  beforeEach(function () {
    process.env.PHILIPS_HUE_HASH = 'foobar';
    process.env.PHILIPS_HUE_IP = '1.2.3.4';
    nock.disableNetConnect();
    this.room = helper.createRoom();
  });

  afterEach(function () {
    delete process.env.PHILIPS_HUE_HASH;
    delete process.env.PHILIPS_HUE_IP;
    nock.cleanAll();
    this.room.destroy();
  });

  // connection failure
  it('simulated connection failure', function (done) {
    nock('https://1.2.3.4')
      .put('/api/foobar/groups/0/action')
      .replyWithError({ code: 'ETIMEDOUT' });

    const selfRoom = this.room;
    selfRoom.user.say('alice', '@hubot meeting');
    setTimeout(
      () => {
        try {
          expect(selfRoom.messages).to.eql([
            ['alice', '@hubot meeting'],
            ['hubot', '@alice Setting lights to meeting mode ...'],
            ['hubot', 'Connection timed out to Hue bridge.'],
          ]);
          done();
        } catch (err) {
          done(err);
        }
      },
      100,
    );
  });

  // bad credentials
  it('simulated bad credentials', function (done) {
    nock('https://1.2.3.4')
      .put('/api/foobar/groups/0/action')
      .replyWithFile(200, `${__dirname}/fixtures/unauthorized-user.json`);

    const selfRoom = this.room;
    selfRoom.user.say('alice', '@hubot meeting');
    setTimeout(
      () => {
        try {
          expect(selfRoom.messages).to.eql([
            ['alice', '@hubot meeting'],
            ['hubot', '@alice Setting lights to meeting mode ...'],
            ['hubot', 'An error ocurred: Error: unauthorized user'],
          ]);
          done();
        } catch (err) {
          done(err);
        }
      },
      100,
    );
  });
});
