// GitHub credentials
const GITHUB_TOKEN = PropertiesService.getScriptProperties().getProperty('GITHUB_TOKEN');
const LEVELS_REPO_OWNER = 'NellowTCS';
const LEVELS_REPO_NAME = 'TeleporterDashLevels';
const MUSIC_REPO_OWNER = 'TeleporterDash';
const MUSIC_REPO_NAME = 'teleporterdash.github.io';
const LEVELS_BASE_URL = `https://api.github.com/repos/${LEVELS_REPO_OWNER}/${LEVELS_REPO_NAME}/contents/`;
const MUSIC_BASE_URL = `https://api.github.com/repos/${MUSIC_REPO_OWNER}/${MUSIC_REPO_NAME}/contents/Sound/Level Soundtracks/`;

// Global variables
let currentMaxId = null;
let contentCache = null;
let cacheTimestamp = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

function doGet() {
  return HtmlService.createHtmlOutput(`
    <!DOCTYPE html>
    <html>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@400..900&display=swap" rel="stylesheet">
        <style>
          body { font-family: "Orbitron", sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background-color: #f0f2f5; }
          .container { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); text-align: center; width: 400px; }
          h2 { color: #333; margin-bottom: 20px; }
          input[type="file"] { margin-bottom: 15px; padding: 5px; width: 100%; }
          button { background-color: #007bff; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; font-size: 16px; transition: background-color 0.3s; }
          button:hover { background-color: #0056b3; }
          button:disabled { background-color: #cccccc; cursor: not-allowed; }
          #status { margin-top: 20px; color: #555; font-size: 14px; white-space: pre-wrap; }
          .loading { display: inline-block; margin-left: 10px; width: 16px; height: 16px; border: 3px solid #f3f3f3; border-top: 3px solid #007bff; border-radius: 50%; animation: spin 1s linear infinite; }
          .error { color: #d9534f; font-weight: bold; }
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        </style>
      </head>
      <body>
        <div class="container">
          <h2>Upload Level to GitHub</h2>
          <input type="file" id="fileInput" accept=".zip,.js"><br>
          <button onclick="uploadFile()" id="uploadBtn">Upload</button>
          <div id="status"></div>
        </div>
        <script>
          function uploadFile() {
            const file = document.getElementById("fileInput").files[0];
            const status = document.getElementById("status");
            const uploadBtn = document.getElementById("uploadBtn");
            
            status.innerHTML = "";
            
            if (!file) {
              status.innerHTML = '<span class="error">Error: Please select a file</span>';
              return;
            }
            const fileName = file.name;
            if (!fileName.match(/\\.(zip|js)$/i)) {
              status.innerHTML = '<span class="error">Error: Only .zip or .js files allowed</span>';
              return;
            }
            
            uploadBtn.disabled = true;
            status.innerHTML = 'Uploading... <span class="loading"></span>';
            
            const fr = new FileReader();
            fr.onload = function(e) {
              const content = e.target.result.split(",")[1];
              google.script.run
                .withSuccessHandler((result) => {
                  status.innerHTML = result.replace(/Error:/g, '<span class="error">Error:</span>');
                  uploadBtn.disabled = false;
                })
                .withFailureHandler((err) => {
                  status.innerHTML = '<span class="error">Error: ' + err.message + '</span>';
                  uploadBtn.disabled = false;
                })
                .processFile(fileName, content);
            };
            fr.onerror = function() {
              status.innerHTML = '<span class="error">Error: Failed to read file</span>';
              uploadBtn.disabled = false;
            };
            fr.readAsDataURL(file);
          }
        </script>
      </body>
    </html>
  `);
}

function processFile(fileName, content) {
  try {
    const decodedContent = Utilities.newBlob(Utilities.base64Decode(content)).getDataAsString();
    const originalContentBase64 = Utilities.base64Encode(decodedContent.replace(/\r\n|\n|\r/g, '\n'));
    Logger.log(`Processing file: ${fileName}, Content: ${originalContentBase64.substring(0, 50)}...`);
    
    const duplicateFound = checkForDuplicateContent(originalContentBase64);
    if (duplicateFound) {
      return `File ${fileName} matches existing content in ${duplicateFound}. No upload needed.`;
    }
    
    if (fileName.match(/\.js$/i)) {
      return processLevelFile(fileName, decodedContent);
    } else if (fileName.match(/\.zip$/i)) {
      return processZipFile(fileName, content);
    }
  } catch (e) {
    throw new Error(`Failed to process ${fileName}: ${e.message}`);
  }
}

function processLevelFile(originalFileName, content) {
  try {
    const levelDataMatch = content.match(/window\.levelData\s*=\s*({[\s\S]*?});/);
    if (!levelDataMatch) throw new Error(`Invalid level file format in ${originalFileName}: window.levelData object not found`);
    
    const titleMatch = content.match(/title:\s*["']((?:[^"']|'[^']*')+)["']/);
    const idMatch = content.match(/id:\s*(\d+)/);
    
    const title = titleMatch ? titleMatch[1] : 'Untitled';
    const currentId = idMatch ? parseInt(idMatch[1]) : 0;
    Logger.log(`Extracted title: "${title}", currentId: ${currentId}`);

    if (currentMaxId === null) {
      currentMaxId = getLatestLevelId();
    }
    const newId = Math.max(currentId, currentMaxId + 1);
    currentMaxId = newId;

    const safeTitle = title.replace(/[^a-zA-Z0-9]+/g, '-').toLowerCase().replace(/-+/g, '-').replace(/^-|-$/g, '');
    let newFileName = `${safeTitle}-level${newId}.js`;
    Logger.log(`Base filename: ${newFileName}`);

    let updatedContent = content.replace(/id:\s*\d+,/, `id: ${newId},`);
    const newContentBase64 = Utilities.base64Encode(updatedContent.replace(/\r\n|\n|\r/g, '\n'));
    let finalFileName = newFileName;
    let existingFile = checkExistingFile(finalFileName, newContentBase64, LEVELS_BASE_URL);

    if (existingFile.exists && !existingFile.isIdentical) {
      const timestamp = Utilities.formatDate(new Date(), "GMT", "yyyyMMdd-HHmmss");
      finalFileName = `${safeTitle}-${timestamp}-level${newId}.js`;
      existingFile = checkExistingFile(finalFileName, newContentBase64, LEVELS_BASE_URL);
      if (existingFile.exists) {
        throw new Error(`File ${finalFileName} already exists (timestamp collision)`);
      }
      Logger.log(`Added timestamp: ${finalFileName}`);
    } else if (existingFile.exists && existingFile.isIdentical) {
      return `File ${finalFileName} already exists with identical content. No upload needed.`;
    }

    uploadToGitHub(finalFileName, newContentBase64, LEVELS_BASE_URL);
    return `Uploaded ${finalFileName} with ID ${newId} successfully!`;
  } catch (e) {
    throw new Error(`Error processing ${originalFileName}: ${e.message}`);
  }
}

function checkExistingFile(fileName, newContentBase64, baseUrl) {
  const url = baseUrl + fileName;
  const options = { 
    method: 'GET', 
    headers: { 'Authorization': `token ${GITHUB_TOKEN}`, 'Accept': 'application/vnd.github+json' }, 
    muteHttpExceptions: true 
  };
  const response = UrlFetchApp.fetch(url, options);
  if (response.getResponseCode() === 200) {
    const fileData = JSON.parse(response.getContentText());
    const existingContent = fileData.content.replace(/\n/g, '');
    const normalizedNewContent = newContentBase64.replace(/\n/g, '');
    const isIdentical = existingContent === normalizedNewContent;
    Logger.log(`Checking ${fileName}: Existing: ${existingContent.substring(0, 50)}..., New: ${normalizedNewContent.substring(0, 50)}..., Identical: ${isIdentical}`);
    return { exists: true, isIdentical, sha: fileData.sha };
  }
  return { exists: false, isIdentical: false, sha: null };
}

function checkForDuplicateContent(newContentBase64) {
  const now = new Date().getTime();
  if (!contentCache || (now - cacheTimestamp > CACHE_DURATION)) {
    refreshCache();
  }
  const normalizedNewContent = newContentBase64.replace(/\n/g, '');
  for (const [fileName, cachedContent] of Object.entries(contentCache)) {
    if (cachedContent === normalizedNewContent) {
      Logger.log(`Duplicate content found in ${fileName}`);
      return fileName;
    }
  }
  return false;
}

function refreshCache() {
  const options = { method: 'GET', headers: { 'Authorization': `token ${GITHUB_TOKEN}`, 'Accept': 'application/vnd.github+json' }, muteHttpExceptions: true };
  const response = UrlFetchApp.fetch(LEVELS_BASE_URL, options);
  if (response.getResponseCode() !== 200) {
    Logger.log('Error fetching GitHub contents: ' + response.getContentText());
    contentCache = {};
    cacheTimestamp = new Date().getTime();
    return;
  }
  const files = JSON.parse(response.getContentText());
  contentCache = {};
  for (const file of files) {
    if (file.name.match(/\.js$/i)) {
      const fileResponse = UrlFetchApp.fetch(file.download_url);
      contentCache[file.name] = Utilities.base64Encode(fileResponse.getContentText().replace(/\r\n|\n|\r/g, '\n')).replace(/\n/g, '');
    }
  }
  cacheTimestamp = new Date().getTime();
  Logger.log('Refreshed content cache');
}

function getLatestLevelId() {
  refreshCache();
  let maxId = 0;
  for (const [fileName, content] of Object.entries(contentCache)) {
    const decodedContent = Utilities.newBlob(Utilities.base64Decode(content)).getDataAsString();
    const idMatch = decodedContent.match(/id:\s*(\d+)/);
    if (idMatch) maxId = Math.max(maxId, parseInt(idMatch[1]));
  }
  Logger.log(`Latest ID found: ${maxId}`);
  return maxId;
}

function uploadToGitHub(fileName, content, baseUrl, retries = 3) {
  const url = baseUrl + fileName;
  const existingFile = checkExistingFile(fileName, content, baseUrl);
  const payload = { 
    message: `Add ${fileName} via Google Apps Script`, 
    content: content, 
    branch: 'main',
    sha: existingFile.exists && existingFile.isIdentical ? existingFile.sha : undefined 
  };
  const options = {
    method: 'PUT',
    headers: { 'Authorization': `token ${GITHUB_TOKEN}`, 'Accept': 'application/vnd.github+json', 'Content-Type': 'application/json' },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };
  
  let lastError;
  for (let i = 0; i < retries; i++) {
    try {
      const response = UrlFetchApp.fetch(url, options);
      if (response.getResponseCode() === 201 || response.getResponseCode() === 200) return;
      lastError = `GitHub API error: ${response.getContentText()}`;
      Logger.log(`Upload failed for ${fileName}: ${response.getResponseCode()} - ${lastError}`);
    } catch (e) {
      lastError = e.message;
      Logger.log(`Upload attempt ${i + 1} failed for ${fileName}: ${e.message}`);
    }
    Utilities.sleep(1000 * (i + 1));
  }
  throw new Error(`Failed to upload ${fileName} after ${retries} attempts: ${lastError}`);
}

function uploadToGitHubBatch(files, baseUrl) {
  const batchSize = 10;
  for (let i = 0; i < files.length; i += batchSize) {
    const batch = files.slice(i, i + batchSize);
    const requests = batch.map(({ fileName, content }) => {
      const url = baseUrl + fileName;
      const existingFile = checkExistingFile(fileName, content, baseUrl);
      return {
        url: url,
        method: 'PUT',
        headers: { 
          'Authorization': `token ${GITHUB_TOKEN}`, 
          'Accept': 'application/vnd.github+json', 
          'Content-Type': 'application/json' 
        },
        payload: JSON.stringify({ 
          message: `Add ${fileName} via batch upload`, 
          content, 
          branch: 'main',
          sha: existingFile.exists && existingFile.isIdentical ? existingFile.sha : undefined 
        }),
        muteHttpExceptions: true
      };
    });
    
    const responses = UrlFetchApp.fetchAll(requests);
    responses.forEach((resp, idx) => {
      if (resp.getResponseCode() !== 201 && resp.getResponseCode() !== 200) {
        Logger.log(`Batch upload failed for ${batch[idx].fileName}: ${resp.getResponseCode()} - ${resp.getContentText()}`);
        throw new Error(`Batch upload failed for ${batch[idx].fileName}: ${resp.getContentText()}`);
      }
    });
  }
}

function isMusicFile(fileName) {
  const musicExtensions = ['.mp3', '.wav', '.ogg', '.flac', '.aac'];
  return musicExtensions.some(ext => fileName.toLowerCase().endsWith(ext));
}

function processZipFile(zipFileName, base64Content) {
  try {
    const decoded = Utilities.base64Decode(base64Content);
    const blob = Utilities.newBlob(decoded, 'application/zip', zipFileName);
    const unzipedFiles = Utilities.unzip(blob);
    let levelFilesToUpload = [];
    let musicFilesToUpload = [];
    currentMaxId = null;

    for (let file of unzipedFiles) {
      const fileName = file.getName();
      const baseFileName = fileName.substring(fileName.lastIndexOf('/') + 1); // Strip path
      const content = file.getDataAsString();
      const contentBase64 = Utilities.base64Encode(content.replace(/\r\n|\n|\r/g, '\n'));

      if (fileName.match(/\.js$/i)) {
        const duplicateFound = checkForDuplicateContent(contentBase64);
        if (duplicateFound) {
          levelFilesToUpload.push({ fileName: baseFileName, result: `File ${baseFileName} matches existing content in ${duplicateFound}. No upload needed.` });
          continue;
        }
        const result = processLevelFile(baseFileName, content);
        if (!result.includes("No upload needed")) {
          const newFileName = result.match(/Uploaded (.*) with/)[1];
          const updatedContent = content.replace(/id:\s*\d+,/, `id: ${currentMaxId},`);
          levelFilesToUpload.push({ fileName: newFileName, content: Utilities.base64Encode(updatedContent), result });
        } else {
          levelFilesToUpload.push({ fileName: baseFileName, result });
        }
      } else if (isMusicFile(fileName)) {
        const fileBlob = file;
        const fileContent = fileBlob.getBytes();
        const fileBase64 = Utilities.base64Encode(fileContent);
        const existingFile = checkExistingFile(baseFileName, fileBase64, MUSIC_BASE_URL);

        let finalFileName = baseFileName;
        if (existingFile.exists && !existingFile.isIdentical) {
          const timestamp = Utilities.formatDate(new Date(), "GMT", "yyyyMMdd-HHmmss");
          finalFileName = baseFileName.replace(/(\.[^/.]+)$/, `-${timestamp}$1`);
          Logger.log(`Music file ${baseFileName} exists with different content, renamed to ${finalFileName}`);
        } else if (existingFile.exists && existingFile.isIdentical) {
          levelFilesToUpload.push({ fileName: baseFileName, result: `Music file ${baseFileName} already exists with identical content. No upload needed.` });
          continue;
        }

        musicFilesToUpload.push({ fileName: finalFileName, content: fileBase64 });
        levelFilesToUpload.push({ fileName: baseFileName, result: `Uploaded music file ${finalFileName} to Sound/Level Soundtracks successfully!` });
      }
    }

    if (levelFilesToUpload.length > 0) {
      const levelUploadCandidates = levelFilesToUpload.filter(f => f.content).map(f => ({ fileName: f.fileName, content: f.content }));
      const musicUploadCandidates = musicFilesToUpload;
      
      if (levelUploadCandidates.length > 0) {
        uploadToGitHubBatch(levelUploadCandidates, LEVELS_BASE_URL);
      }
      if (musicUploadCandidates.length > 0) {
        uploadToGitHubBatch(musicUploadCandidates, MUSIC_BASE_URL);
      }
      
      return levelFilesToUpload.map(f => f.result).join('\n');
    }
    return "No valid .js or music files found in the zip archive";
  } catch (e) {
    throw new Error(`Error processing zip file ${zipFileName}: ${e.message}`);
  }
}

function setupProperties() {
  PropertiesService.getScriptProperties().setProperty('GITHUB_TOKEN', 'your-personal-access-token');
}
