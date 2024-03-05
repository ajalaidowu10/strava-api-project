function setRefreshToken(refreshToken) {
  PropertiesService.getScriptProperties().setProperty('refreshToken', refreshToken);
}

function getRefreshToken() {
  return PropertiesService.getScriptProperties().getProperty('refreshToken');
}

function getCurrentDate() {
  // Get the current date
  const currentDate = new Date();
  
  // Format the current date as "YYYY-MM-DD"
  const formattedDate = Utilities.formatDate(currentDate, Session.getScriptTimeZone(), "yyyy-MM-dd");
  
  return formattedDate;
}
function getLastRecords(numOfRecord=10) {
  // Get the active sheet
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  // Get the total number of rows with data
  let lastRow = sheet.getLastRow();
 //console.log(lastRow);
  let startCount = lastRow >= numOfRecord ? 1 : 2;
  // Calculate the range for the last 10 rows
  const startRow = Math.max(lastRow - numOfRecord + 1, startCount); // Ensure startRow is not negative
  //console.log(startRow);
  const range = sheet.getRange(startRow, 1, numOfRecord, sheet.getLastColumn() - 1); // Adjust the last column as needed
  
  // Get the values of the last 10 rows
  const lastRecords = range.getValues();
  
  return lastRecords;
}

function getNewRecords(existingData, apiResult) {
  // Filter new records
  var newRecords = apiResult.filter(function(record) {
    // Check if the record already exists in the existingData array
    return !existingData.some(function(existingRecord) {
      // Compare records by all values
      return JSON.stringify(existingRecord) === JSON.stringify(record);
    });
  });

  return newRecords;
}
function fetchAccessKey() {
  return new Promise(function(resolve, reject) {
    let refreshToken = getRefreshToken(); // Retrieve the refresh token from properties
    //console.log('refreshToken', refreshToken);
    const clientId = '120519';
    const clientSecret = '91fed4f20e0d2a00e260f7ab4fd9ce3f42cc045d';
    
    const response = UrlFetchApp.fetch('https://www.strava.com/oauth/token', {
      method: 'post',
      contentType: 'application/x-www-form-urlencoded',
      payload: {
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: clientId,
        client_secret: clientSecret
      }
    });
    
    const data = JSON.parse(response.getContentText());
    setRefreshToken(data.refresh_token);

    resolve(data.access_token);
  });
}

function fetchData(numOfRecord=10) {
  return new Promise((resolve, reject) => {
    fetchAccessKey()
    .then(function(access_token) {
      const page = 1;
      const options = {
        headers: {
          Authorization: `Bearer ${access_token}`
        }
      }
      const response = UrlFetchApp.fetch(`https://www.strava.com/api/v3/clubs/491970/activities?page=${page}&per_page=${numOfRecord}`, options);
      const data = JSON.parse(response.getContentText());

      resolve(data.map(activity => [`${activity.athlete.firstname} ${activity.athlete.lastname}`, activity.sport_type, activity.name, activity.distance, activity.moving_time]));
    })
    .catch(function(error) {
      console.error('Error refreshing access token:', error);
    });
  });

}

function writeToSheet(newData) {
  // Get the active spreadsheet
  const date = getCurrentDate();
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const data = newData.map(activity => [...activity, date]).reverse();

  // Get the last row with data
  let lastRow = sheet.getLastRow();

  // Calculate the start row for appending new data
  let startRow = lastRow + 1;

  // Write the new data to the sheet starting from cell A1
  sheet.getRange(startRow, 1, data.length, data[0].length).setValues(data);
}

function main_program() {
  fetchData(20)
  .then(function(apiResult) {
    const existingRecord = getLastRecords(20);
    const newRecords = getNewRecords(existingRecord, apiResult);
    //console.log(apiResult);
    //console.log(existingRecord);
    //console.log(newRecords);
    newRecords.length && writeToSheet(newRecords);
  })
  .catch(function(error) {
      console.error('Error refreshing access token:', error);
  });
}

function scheduleRunMain() {
  // Create a time-driven trigger to run main function every 3 hours
  ScriptApp.newTrigger('main_program')
    .timeBased()
    .everyHours(4)
    .create();
}

