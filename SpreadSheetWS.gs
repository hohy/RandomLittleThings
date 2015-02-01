// General function, which converts spreadsheet list into the JSON file.
// Expects that first row of the list contains header of the table.
function doGet(e) {
  // array with table headers
  var headers = new Array();  
  // array that will contain result data
  var results = new Array();
  
  // get the spreadsheet
  var ss = SpreadsheetApp.openByUrl("https://docs.google.com/spreadsheets/d/XXXXXXXX/edit");
  var sheet = ss.getSheets()[0];

  var columnCount = sheet.getLastColumn();
  var rowCount = sheet.getLastRow();  
  
  // get column names from the sheet header
  var headerRange = sheet.getRange(1, 1, 1, columnCount);
  for (var clm = 1; clm <= columnCount; clm++) {
    headers[clm] = headerRange.getCell(1, clm).getValue();
  }
  
  var data = sheet.getRange(2, 1, rowCount, columnCount);
  
  // fill the results data structure with data from the spreadsheet
  for (var row = 1; row < rowCount; row++) {
    var result = {};
    for (var clm = 1; clm <= columnCount; clm++) {
      result[headers[clm]] = data.getCell(row, clm).getValue();
    }
    
    results.push(result);
  }      
  
  // convert structure into the JSON format and return it.
  return ContentService.createTextOutput(JSON.stringify(results)).setMimeType(ContentService.MimeType.JSON);
}