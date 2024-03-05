const express = require('express')
const app = express()
/**
 * Strava API access permission
 * https://yizeng.me/2017/01/11/get-a-strava-api-access-token-with-write-permission
 */

/**
 * Strava webhook events API
 * https://developers.strava.com/docs/webhooks/
 */

app.get('/', (req, res) => {
  console.log('Hello');
})
app.listen(3000, () => {
  console.log('Heloo world');
})