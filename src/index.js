import fetch from 'isomorphic-fetch';
import cheerio from 'cheerio';

const STATUS_OK = 200;
const STATUS_NOT_FOUND = 404;

/**
 * @typedef {Object} Stats
 * @property {Array<{date: string, count: number}>} contributions - List of contributions
 * @property {CurrentStreak} currentStreak - Current streak
 * @property {LongestStreak} longestStreak - Longest streak
 * @property {Object} [summary] - Summary of contributions
 * @property {string} summary.start - Start date of contributions
 * @property {string} summary.end - End date of contributions
 * @property {string} summary.total - Total contributions
 * @property {?{date: string, count: number}} [summary.busiestDay] - Busiest day of contributions
 * @property {string} [calendar] - SVG of contributions calendar
 *
 * @example
 * {
 *   contributions: [
 *     {date: '2015-01-23', count: 0},
 *     ...
 *   ],
 *   calendar: '<svg>....</svg>'
 *   currentStreak: {days: 0, end: null, start: null, unmeasurable: false},
 *   longestStreak: {days: 5, end: '2016-01-12', start: '2016-01-16', unmeasurable: false},
 *   summary: {
 *     busiestDay: {date: '2015-11-02', count: 34},
 *     end: '2016-01-23',
 *     start: '2015-01-23',
 *     total: 1271
 *   }
 * }
 */
/**
 * @typedef {Object} Streak
 * @property {number} days - Days
 * @property {?string} end - End date
 * @property {?string} start - Start date
 * @property {boolean} unmeasurable - Streak is over than 1 year
 */


/**
 * Fetch contributions and streaks of GitHub user
 *
 * @param {string} username GitHub username
 * @param {Object} [opts] Options
 * @param {boolean} [opts.summary=true] Flag of includes summary
 * @return {Promise<Stats, Error>}
 */
export function fetchStats(username, {summary = true} = {}) {
  return fetchContributions(username).then(contributionData => {
    const {contributions} = contributionData;
    const streakData = getStreaks(contributions);
    return Object.assign({}, contributionData, streakData);
  }).then(result => {
    const res = Object.assign({}, result);
    if (summary) {
      return Object.assign({}, res, {summary: summarizeContributions(res.contributions)});
    }
    return res;
  });
}


/**
 * Fetch contributions of GitHub user
 *
 * @param {string} username - GitHub username
 * @return {Promise<{calendar: string, contributions: Array<{date: string, count: number}>}, Error>}
 */
export function fetchContributions(username) {
  return fetchGitHub(`https://github.com/users/${username}/contributions`)
    .then(html => {
      return {
        calendar: html,
        contributions: parseCalendar(cheerio(html))
      };
    });
}


/**
 * Fetch HTML from GitHub
 *
 * @param {string} url - URL
 * @return {Promise<string, Error>}
 */
function fetchGitHub(url) {
  return fetch(url).then(res => {
    if (res.status === STATUS_NOT_FOUND) {
      throw new Error('USER_NOT_FOUND');
    } else if (res.status !== STATUS_OK) {
      throw new Error('CANNOT_FETCH_DATA');
    }
    return res.text();
  });
}


/**
 * Parse data to streak
 *
 * @param {Array<{date: string, count: number}>} contributions - List of contributions
 * @return {{currentStreak: Streak, longestStreak: Streak}}
 */
function getStreaks(contributions) {
  const start = contributions[0].date;
  const end = contributions.slice(-1)[0].date;
  const streak = {days: 0, start: null, end: null, unmeasurable: false};
  let currentStreak = Object.assign({}, streak);
  let longestStreak = Object.assign({}, streak);
  contributions.forEach(ret => {
    if (ret.count > 0) {
      currentStreak.days += 1;
      currentStreak.end = ret.date;
      if (!currentStreak.start) {
        currentStreak.start = ret.date;
      }
      if (currentStreak.days >= longestStreak.days) {
        longestStreak = Object.assign({}, currentStreak);
      }
    } else if (ret.date !== end) {
      currentStreak = Object.assign({}, streak);
    }
  });
  if (currentStreak.start === start && currentStreak.end === end) {
    currentStreak.unmeasurable = true;
    longestStreak.unmeasurable = true;
  }
  return {currentStreak, longestStreak};
}


/**
 * Parse HTML to list of contribution
 *
 * @param {Object} $calendar - cheerio object
 * @return {Array<{date: string, count: number}>}
 */
function parseCalendar($calendar) {
  const data = [];
  $calendar.find('rect').each((i, elm) => {
    const $rect = cheerio(elm);
    const date = $rect.attr('data-date');
    if (!date) {
      return;
    }
    data.push({
      date,
      count: parseInt($rect.attr('data-count'), 10)
    });
  });
  return data;
}


/**
 * Summarize list of contribution
 *
 * @param {Array<{date: string, count: number}>} contributions - List of contribution
 * @return {{end: string, start: string, total: number, busiestDay: {date: string, count: number}}}
 */
function summarizeContributions(contributions) {
  let busiestDay = null;
  let total = 0;
  contributions.forEach(d => {
    if (d.count > 0 && (!busiestDay || d.count > busiestDay.count)) {
      busiestDay = d;
    }
    total += d.count;
  });
  return {
    busiestDay,
    end: contributions.slice(-1)[0].date,
    start: contributions[0].date,
    total
  };
}
