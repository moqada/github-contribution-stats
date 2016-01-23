import assert from 'power-assert';
import {fetchStats, fetchContributions, fetchStreaks} from '../src';

describe('github-contribution-stats', () => {
  it('fetchStats()', () => fetchStats('moqada').then(res => assert(res)));
  it('fetchContributions()', () => fetchContributions('moqada').then(res => assert(res)));
  it('fetchStreaks()', () => fetchStreaks('moqada').then(res => assert(res)));
});
