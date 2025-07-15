const fs = require('fs');
const fetch = require('node-fetch');

const username = 'your-github-username';
const token = process.env.GITHUB_TOKEN; // store in repo secrets

const query = `
{
  user(login: "${username}") {
    contributionsCollection {
      contributionCalendar {
        weeks {
          contributionDays {
            contributionCount
            weekday
          }
        }
      }
    }
  }
}
`;

fetch('https://api.github.com/graphql', {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ query }),
})
  .then(res => res.json())
  .then(data => {
    const gridData = data.data.user.contributionsCollection.contributionCalendar.weeks.flatMap((week, wIndex) =>
      week.contributionDays.map(day => ({
        week: wIndex,
        day: day.weekday,
        level:
          day.contributionCount >= 15 ? 4 :
          day.contributionCount >= 10 ? 3 :
          day.contributionCount >= 5 ? 2 :
          day.contributionCount >= 1 ? 1 : 0,
        id: `${wIndex}-${day.weekday}`
      }))
    );
    fs.writeFileSync('./dist/contributions.json', JSON.stringify(gridData));
  });
