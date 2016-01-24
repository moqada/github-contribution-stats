# github-contribution-stats

[![NPM version][npm-image]][npm-url]
[![NPM downloads][npm-download-image]][npm-download-url]
[![Build Status][travis-image]][travis-url]
[![Coverage Status][codecov-image]][codecov-url]
[![Dependency Status][daviddm-image]][daviddm-url]
[![DevDependency Status][daviddm-dev-image]][daviddm-dev-url]
[![License][license-image]][license-url]

Fetch GitHub Contributions and Streaks from GitHub website.


## Installation

```
npm install --save github-contribution-stats
```


## Usage

### Stats

Get user's Contributions and Streaks from GitHub.

```javascript
import {fetchStats} from 'github-contribution-stats';

fetchStats('moqada').then(stats => console.log(stats));
// {
//   calendar: '<svg>...</svg>',
//   contributions: [
//     {
//       date: '2015-01-23',
//       count: 0
//     },
//     ...
//     {
//       date: '2016-01-23',
//       count: 0
//     }
//   ],
//   currentStreak: {
//     days: 139,
//     end: '2016-01-22',
//     start: '2015-09-06'
//   },
//   longestStreak: {
//     days: 139,
//     end: '2016-01-22',
//     start: '2015-09-06'
//   },
//   summary: {
//     busiestDay: {
//       date: '2015-11-02',
//       count: 34
//     },
//     end: '2016-01-23',
//     start: '2015-01-23',
//     total: 1271
//   }
// }
```


### Streaks

Get uses's Streaks from GitHub.

```javascript
import {fetchStreaks} from 'github-contribution-stats';

fetchStreaks('moqada').then(streaks => console.log(streaks));
// {
//   currentStreak: {
//     days: 139,
//     end: '2016-01-22',
//     start: '2015-09-06'
//   },
//   longestStreak: {
//     days: 139,
//     end: '2016-01-22',
//     start: '2015-09-06'
//   }
// }
```


### Contributions

Get users's Contributions from GitHub.

```javascript
import {fetchContributions} from 'github-contribution-stats';

fetchContributions('moqada').then(contributions => console.log(contributions));
// {
//   calendar: '<svg>...</svg>',
//   contributions: [
//     {
//       date: '2015-01-23',
//       count: 0
//     },
//     ...
//     {
//       date: '2016-01-23',
//       count: 0
//     }
//   ]
// }
```

More detail, See [Doc](https://moqada.github.io/github-contribution-stats/).

[npm-url]: https://www.npmjs.com/package/github-contribution-stats
[npm-image]: https://img.shields.io/npm/v/github-contribution-stats.svg?style=flat-square
[npm-download-url]: https://www.npmjs.com/package/github-contribution-stats
[npm-download-image]: https://img.shields.io/npm/dt/github-contribution-stats.svg?style=flat-square
[travis-url]: https://travis-ci.org/moqada/github-contribution-stats
[travis-image]: https://img.shields.io/travis/moqada/github-contribution-stats.svg?style=flat-square
[daviddm-url]: https://david-dm.org/moqada/github-contribution-stats
[daviddm-image]: https://img.shields.io/david/moqada/github-contribution-stats.svg?style=flat-square
[daviddm-dev-url]: https://david-dm.org/moqada/github-contribution-stats#info=devDependencies
[daviddm-dev-image]: https://img.shields.io/david/dev/moqada/github-contribution-stats.svg?style=flat-square
[codecov-url]: https://codecov.io/github/moqada/github-contribution-stats
[codecov-image]: https://img.shields.io/codecov/c/github/moqada/github-contribution-stats.svg?style=flat-square
[license-url]: http://opensource.org/licenses/MIT
[license-image]: https://img.shields.io/npm/l/github-contribution-stats.svg?style=flat-square
