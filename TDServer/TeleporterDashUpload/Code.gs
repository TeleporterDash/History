var GITHUB_TOKEN = '[=============Stripped=============]'; // GitHub token for authorization
var GITHUB_REPO = 'NellowTCS/TeleporterDashLevels'; // GitHub repository name
var GITHUB_API_URL = 'https://api.github.com/repos/' + GITHUB_REPO + '/contents/';

function unzipAndUploadToGitHub() {
  var folderId = '[=============Stripped=============]'; // ID of the Google Drive folder containing .zip files
  var folder = DriveApp.getFolderById(folderId);
  
  // Folder to move processed zips to
  var processedFolderId = '[=============Stripped=============]';
  var processedFolder = DriveApp.getFolderById(processedFolderId);

  // Get all .zip files in the folder
  var zipFiles = folder.getFilesByType(MimeType.ZIP);

  while (zipFiles.hasNext()) {
    var zipFile = zipFiles.next();
    var fileName = zipFile.getName();
    var unzippedFiles = Utilities.unzip(zipFile.getBlob());

    Logger.log('Unzipping file: ' + fileName);
    Logger.log('Number of files unzipped: ' + unzippedFiles.length);

    unzippedFiles.forEach(function (unzippedFile) {
      if (!unzippedFile) {
        Logger.log('Error: unzippedFile is undefined or null.');
        return;
      }

      var unzippedFileName = unzippedFile.getName();
      var fileBlob = unzippedFile;

      if (!fileBlob || typeof fileBlob.getBytes !== 'function' || typeof fileBlob.getContentType !== 'function') {
        Logger.log('Error: fileBlob is not valid for file: ' + unzippedFileName);
        return;
      }

      Logger.log('Processing file: ' + unzippedFileName);

      if (unzippedFileName.endsWith('.txt')) {
        Logger.log('Skipping text file: ' + unzippedFileName);
        return;
      } else if (unzippedFileName.endsWith('.js')) {
        // Remove all path components and keep only the base file name
        var baseFileName = unzippedFileName.substring(unzippedFileName.lastIndexOf('/') + 1);
        Logger.log('Uploading .js file to root: ' + baseFileName);
        uploadFileToGitHub(baseFileName, fileBlob, ''); // Upload .js files to the root directory
      } else if (isMusicFile(unzippedFileName)) {
        // Remove all path components and keep only the base file name
        var baseFileName = unzippedFileName.substring(unzippedFileName.lastIndexOf('/') + 1);
        Logger.log('Uploading music file to Sound/Level Soundtracks: ' + baseFileName);
        uploadFileToGitHub(baseFileName, fileBlob, 'Sound/Level Soundtracks'); // Upload to designated folder without subdirectories
      } else {
        Logger.log('Unhandled file type: ' + unzippedFileName);
      }
    });

    // After processing the zip file, move it to the "processed" folder
    try {
      var processedZip = processedFolder.createFile(zipFile.getBlob());
      zipFile.setTrashed(true); // Move the zip file to the trash (delete it)
      Logger.log('Moved zip file to processed folder: ' + fileName);
    } catch (error) {
      Logger.log('Error moving zip file: ' + fileName + ' - ' + error.message);
    }
  }
}

function isMusicFile(fileName) {
  var musicExtensions = ['.mp3', '.wav', '.ogg', '.flac', '.aac'];
  return musicExtensions.some(function (ext) {
    return fileName.toLowerCase().endsWith(ext);
  });
}

function uploadFileToGitHub(fileName, fileBlob, folderPath) {
  if (folderPath.startsWith('/')) {
    folderPath = folderPath.substring(1);  // Remove leading slash
  }
  if (folderPath.endsWith('/')) {
    folderPath = folderPath.slice(0, -1);  // Remove trailing slash
  }

  var githubPath = folderPath ? folderPath + '/' + fileName : fileName;
  var githubUrl = GITHUB_API_URL + githubPath;

  // Get the SHA and content of the file if it already exists
  var response;
  var existingFile = null;
  try {
    response = UrlFetchApp.fetch(githubUrl, {
      method: 'GET',
      headers: {
        Authorization: 'token ' + GITHUB_TOKEN
      }
    });
    if (response.getResponseCode() === 200) {
      existingFile = JSON.parse(response.getContentText());
    }
  } catch (error) {
    existingFile = null;
  }

  var fileContent = fileBlob.getBytes();
  var fileBase64 = Utilities.base64Encode(fileContent);

  // If the file exists, compare contents
  if (existingFile) {
    var currentFileContent = Utilities.base64Decode(existingFile.content);
    
    // Check if the contents are different
    if (currentFileContent && currentFileContent.length === fileContent.length && currentFileContent.every((val, index) => val === fileContent[index])) {
      Logger.log('The file contents are the same. No need to upload.');
      return; // Do nothing if contents are identical
    }
  }

  // Generate a new file name if content is different (to avoid overwriting)
  var newFileName = fileName;
  if (existingFile) {
    // Create a versioned file name with a timestamp or incremented version number
    var timestamp = new Date().toISOString().replace(/[-T:.Z]/g, ''); // Create a timestamp-based name
    newFileName = fileName.replace(/(\.[^/.]+)$/, `${timestamp}$1`); // Append timestamp before file extension
  }

  var payload = {
    message: 'Add ' + newFileName,  // Update message
    content: fileBase64,
    committer: {
      name: 'NellowTCS',
      email: 'neeljaiswal23@gmail.com'
    }
  };

  var options = {
    method: 'PUT',
    headers: {
      Authorization: 'token ' + GITHUB_TOKEN
    },
    payload: JSON.stringify(payload)
  };

  try {
    var newGitHubUrl = GITHUB_API_URL + (folderPath ? folderPath + '/' : '') + newFileName;  // Ensure no leading slash in the URL
    UrlFetchApp.fetch(newGitHubUrl, options);
    Logger.log('Successfully uploaded ' + newFileName);
  } catch (error) {
    Logger.log('Error uploading file: ' + newFileName + ' - ' + error.message);
  }
}
