function doPost(e) {
  var sourceName = 'game'; // Hardcoded for testing

  if (!sourceName) {
    return ContentService.createTextOutput("Error: 'name' parameter is missing.")
      .setMimeType(ContentService.MimeType.TEXT);
  }

  // Explicitly use the Spreadsheet ID
  var spreadsheetId = '[=============Stripped=============]';
  var sheet = SpreadsheetApp.openById(spreadsheetId);

  if (!sheet) {
    return ContentService.createTextOutput("Error: Sheet 'TD-Download Counter' not found.")
      .setMimeType(ContentService.MimeType.TEXT);
  }

  var data = sheet.getDataRange().getValues();
  var found = false;
  var currentCount = 0;

  // Loop through the rows to find the download count for the specified source
  for (var i = 0; i < data.length; i++) {
    var sheetName = data[i][0].trim(); // Trim the sheet name to avoid extra spaces
    Logger.log('Checking row: ' + i + ', sheet name: ' + sheetName);  // Log the current row and sheet name

    if (sheetName === sourceName) {
      currentCount = data[i][1];
      currentCount++;
      
      var row = parseInt(i + 1, 10);  // Ensure row is a valid integer
      var col = 2;  // Column number (2 corresponds to column B)
      
      // Ensure both row and col are numbers
      Logger.log('Checking getRange with Row: ' + row + ' and Column: ' + col);

      // Force conversion to numbers (just in case)
      row = Number(row);
      col = Number(col);

      // Check that both row and column are definitely numbers
      if (typeof row === 'number' && !isNaN(row) && typeof col === 'number' && !isNaN(col)) {
        try {
          var currentCellValue = sheet.getRange(row, col).getValue();
          Logger.log('Current value at row ' + row + ', column ' + col + ': ' + currentCellValue);

          sheet.getRange(row, col).setValue(currentCount);  // Update the download count in column B
          Logger.log('Successfully updated row ' + row + ' at column ' + col + ' with new value: ' + currentCount);
        } catch (error) {
          Logger.log('Error occurred: ' + error);  // Log the error for debugging
        }
      } else {
        Logger.log('Error: Row or column is not a valid number!');
      }

      found = true;
      break;
    }
  }

  if (!found) {
    return ContentService.createTextOutput("Error: Source name not found.")
      .setMimeType(ContentService.MimeType.TEXT);
  }

  // Return the updated download count for the source
  return ContentService.createTextOutput(JSON.stringify({ message: "Download incremented", downloads: currentCount }))
    .setMimeType(ContentService.MimeType.JSON);
}
