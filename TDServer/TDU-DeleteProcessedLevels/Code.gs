function deleteProcessedFiles() {
  var processedFolderId = '[=============Stripped=============]'; // ID of the processed folder
  var processedFolder = DriveApp.getFolderById(processedFolderId);
  
  var files = processedFolder.getFiles();
  
  while (files.hasNext()) {
    var file = files.next();
    try {
      file.setTrashed(true); // Moves the file to trash (deletes it)
      Logger.log('File moved to trash: ' + file.getName());
    } catch (error) {
      Logger.log('Error deleting file: ' + file.getName() + ' - ' + error.message);
    }
  }
}
