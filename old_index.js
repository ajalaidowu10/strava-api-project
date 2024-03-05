const axios = require('axios');
const { google } = require('googleapis');

// Set up Google Sheets API credentials
const sheets = google.sheets('v4');
const spreadsheetId = '1FDSbdy-r167_hWzsrAzJe8DSwtTLiieAPD0_CJt5ryU';
const range = 'Sheet1';

const sheetsAuth = new google.auth.GoogleAuth({
  keyFile: 'stava-api-project-2560c52aa8c9.json', 
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});


// Set up Strava API credentials
const stravaAccessToken = 'f0157dee3addcaa8542bd24a12b99202e4db2664'; 

// fetch Strava club activities
async function fetchStravaActivities() {
  try {
    const response = await axios.get(`https://www.strava.com/api/v3/athlete/activities`, {
      headers: {
        Authorization: `Bearer ${stravaAccessToken}`,
      },
    });
    console.log(response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching Strava activities:', error);
    throw error;
  }
}

// write data to Google Sheet
async function writeToGoogleSheet(data) {
  const sheetsClient = await sheetsAuth.getClient();

  //console.log('sheetsClient', sheetsClient);

  const sheetsRequest = {
    auth: sheetsClient,
    spreadsheetId,
    range,
    valueInputOption: 'USER_ENTERED',
    resource: {
      values: data.map(activity => [activity.name, activity.sport_type, activity.distance, activity.start_date_local]),
    },
  };

  try {
    const response = await sheets.spreadsheets.values.append(sheetsRequest);
    console.log('Data written to Google Sheet:', response.data);
  } catch (error) {
    console.error('Error writing data to Google Sheet:', error.message);
    throw error;
  }
}

// Main function to fetch Strava activities and write to Google Sheet
async function main() {
  try {
    const stravaActivities = await fetchStravaActivities();
    await writeToGoogleSheet(stravaActivities);
  } catch (error) {
    console.error('An error occurred:', error.message);
  }
}

module.exports = { main }
