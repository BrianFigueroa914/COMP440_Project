const { app, BrowserWindow } = require('electron');

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: __dirname + '/preload.js'
    }
  });

  win.loadFile('src/pages/loginPage/index.html'); // or loadURL('https://your-web-app.com')
}

app.whenReady().then(createWindow);