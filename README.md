# LocalizeCron
Localize a cron expression using offset in minutes

```js
const utc = `0 0 2 * * 2`
// 02:00, every Monday

const est = localizeCronExpression(utc, -240, {
  dayOfWeekStartIndexZero:false,
  monthStartIndexZero:false
})
// 0 0 22 * * 1
// 22:00, every Sunday
```
