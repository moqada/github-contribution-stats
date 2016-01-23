import fetch from 'isomorphic-fetch';
import moment from 'moment';
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
 * @propety {string} [calendar] - SVG of contributions calendar
 *
 * @example
 * {
 *   contributions: [
 *     {date: '2015-01-23', count: 0},
 *     ...
 *   ],
 *   calendar: '<svg>....</svg>'
 *   currentStreak: {days: 0, end: null, start: null, last: '2016-01-23T08:00:00Z' },
 *   longestStreak: {days: 5, end: '2016-01-12', start: '2016-01-16' },
 *   summary: {
 *     busiestDay: {date: '2015-11-02', count: 34},
 *     end: '2016-01-23',
 *     start: '2015-01-23',
 *     total: 1271
 *   }
 * }
 */
/**
 * @typedef {Object} CurrentStreak
 * @property {number} days - Days
 * @property {?string} end - End date
 * @property {?string} start - Start date
 * @property {?string} [last] - Last datetime of contribution when current streak is 0
 */
/**
 * @typedef {Object} LongestStreak
 * @property {number} days - Days
 * @property {?string} end - End date
 * @property {?string} start - Start date
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
    return fetchStreaks(username).then(streakData => {
      return Object.assign({}, contributionData, streakData);
    });
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
 * Fetch streaks of GitHub user
 *
 * Sometimes, it cannot get streaks DOM because did not render in GitHub website.
 * In that case, it comes to be success when it request over second times.
 *
 * @param {string} username - GitHub username
 * @return {Promise<{currentStreak: CurrentStreak, longestStreak: LongestStreak}, Error>}
 */
export function fetchStreaks(username) {
  return fetchGitHub(`https://github.com/${username}`)
    .then(html => {
      const $html = cheerio.load(html);
      if (!isUser(username, $html)) {
        throw new Error('USER_NOT_FOUND');
      }
      const $columns = $html('#contributions-calendar > .contrib-column');
      if ($columns.length === 0) {
        throw new Error('CANNOT_FETCH_STREAKS');
      }
      const [total, longest, current] = $columns.map((i, elm) => {
        return parseContribColumn(cheerio(elm));
      }).toArray();
      const currentDate = moment.utc(total.end, 'MMM D, YYYY').toDate();
      return {
        currentStreak: parseStreaks(current, currentDate),
        longestStreak: parseStreaks(longest, currentDate)
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
 * Decide GitHub user page or not
 *
 * @param {string} username - GitHub username
 * @param {Object} $html - cheerio object
 * @return {boolean}
 */
function isUser(username, $html) {
  const atomUrl = $html('head > link[title=atom]').attr('href');
  return atomUrl && atomUrl === `/${username}.atom`;
}


/**
 * Parse HTML of `contrib-column` to data
 *
 * @param {Object} $column - cheerio object
 * @return {{number: number, start: (string|null), end: (string|null), last: (string|null)}}
 */
function parseContribColumn($column) {
  const number = parseInt($column.find('.contrib-number').text().split(' ')[0], 10);
  const $range = $column.find('.text-muted').last();
  const last = $range.find('time').attr('datetime') || null;
  let end = null;
  let start = null;
  if (!last) {
    const rangeText = $range.text();
    [start, end] = rangeText.split('\u2013').map(s => s.trim());
  }
  return {number, end, start, last};
}


/**
 * Parse data to streak
 *
 * @param {{number: number, start: (string|null), end: (string|null), last: (string|null)}} data - ret of parseContribColumn
 * @param {Date} currentDate - current date
 * @return {{days: number, end: (string|null), start: (string|null), last: (string|null)}}
 */
function parseStreaks(data, currentDate) {
  const result = {days: data.number, end: null, start: null};
  if (data.number === 0) {
    if (data.last) {
      return Object.assign({}, result, {last: data.last});
    }
    return result;
  }
  const end = moment(data.end, 'MMM, D').year(currentDate.getFullYear());
  if (end.diff(currentDate) > 0) {
    end.subtract(1, 'years');
  }
  const start = end.clone().subtract(result.days - 1, 'days');
  return Object.assign({}, result, {
    end: end.format('YYYY-MM-DD'),
    start: start.format('YYYY-MM-DD')
  });
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
