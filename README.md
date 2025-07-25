# LocalizeCron
Localize a cron expression using offset in minutes

```js
const est = `0 0 22 * * 1`                   //22:00, only on Sunday
const utc = localizeCronExpression(est, 240) //02:00, only on Monday
console.log(utc)                             //0 0 2 * * 2
```
