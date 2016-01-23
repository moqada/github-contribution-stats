/* eslint-disable no-magic-numbers, max-nested-callbacks */
import fs from 'fs';
import path from 'path';
import assert from 'power-assert';
import nock from 'nock';
import {fetchStats, fetchContributions, fetchStreaks} from '../src';

const fixtureDir = path.resolve('./test/fixtures');

describe('github-contribution-stats', () => {
  let mockHtml = null;
  let mockSvg = null;
  let mockServer = null;
  before(() => {
    mockHtml = fs.readFileSync(path.join(fixtureDir, 'moqada.html')).toString();
    mockSvg = fs.readFileSync(path.join(fixtureDir, 'moqada.svg')).toString();
  });
  beforeEach(() => {
    mockServer = nock('https://github.com');
  });
  afterEach(() => {
    nock.cleanAll();
  });

  /** @test {fetchStats} */
  describe('fetchStats()', () => {
    beforeEach(() => {
      mockServer
        .get('/users/moqada/contributions')
        .reply(200, mockSvg)
        .get('/moqada')
        .reply(200, mockHtml);
    });

    it('should return valid stats', () => {
      const fixtureFile = fs.readFileSync(path.join(fixtureDir, 'stats-valid-moqada.json'));
      const valid = JSON.parse(fixtureFile.toString());
      return fetchStats('moqada').then(stat => assert.deepEqual(stat, valid));
    });

    it('should return valid stats with summary option', () => {
      const fixtureFile = fs.readFileSync(path.join(fixtureDir, 'stats-valid-moqada.json'));
      const valid = JSON.parse(fixtureFile.toString());
      delete valid.summary;
      return fetchStats('moqada', {summary: false}).then(stat => assert.deepEqual(stat, valid));
    });
  });

  /** @test {fetchContributions} */
  describe('fetchContributions()', () => {
    beforeEach(() => {
      mockServer
        .get('/users/moqada/contributions')
        .reply(200, mockSvg);
    });
    it('should return valid contributions', () => {
      const fixtureFile = fs.readFileSync(path.join(fixtureDir, 'contributions-valid-moqada.json'));
      const valid = JSON.parse(fixtureFile.toString());
      return fetchContributions('moqada').then(stat => assert.deepEqual(stat, valid));
    });
  });

  /** @test {fetchStreaks} */
  describe('fetchStreaks()', () => {
    beforeEach(() => {
      mockServer
        .get('/moqada')
        .reply(200, mockHtml);
    });
    it('should return valid streaks', () => {
      const fixtureFile = fs.readFileSync(path.join(fixtureDir, 'streaks-valid-moqada.json'));
      const valid = JSON.parse(fixtureFile.toString());
      return fetchStreaks('moqada').then(stat => assert.deepEqual(stat, valid));
    });
  });
});
