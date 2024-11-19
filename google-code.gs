
const sheetName = 'Sheet1'
const scriptProp = PropertiesService.getScriptProperties()

function initialSetup () {
  //Retrieves the spreadsheet that is currently open.
  const activeSpreadsheet = SpreadsheetApp.getActiveSpreadsheet()
  //Saves the ID of that spreadsheet into the key property in scriptProp, allowing other functions to access this ID later.
  scriptProp.setProperty('key', activeSpreadsheet.getId())
}

function doPost (e) {
  //Acquires a lock to prevent simultaneous access to resources for 10 seconds
  const lock = LockService.getScriptLock()
  lock.tryLock(10000)

  try {
    //Opens the spreadsheet based on the saved ID.
    const doc = SpreadsheetApp.openById(scriptProp.getProperty('key'))
    const sheet = doc.getSheetByName(sheetName)

    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0]
    const nextRow = sheet.getLastRow() + 1

    const newRow = headers.map(function(header) {
      return header === 'Date' ? new Date() : e.parameter[header]
    })

    sheet.getRange(nextRow, 1, 1, newRow.length).setValues([newRow])

    return ContentService
      .createTextOutput(JSON.stringify({ 'result': 'success', 'row': nextRow }))
      .setMimeType(ContentService.MimeType.JSON)
  }

  catch (e) {
    //If an error occurs during execution, it returns an error message in JSON format.
    return ContentService
      .createTextOutput(JSON.stringify({ 'result': 'error', 'error': e }))
      .setMimeType(ContentService.MimeType.JSON)
  }

  finally {
    //releash lock
    lock.releaseLock()
  }
}
