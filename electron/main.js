const { app, BrowserWindow } = require('electron');

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: __dirname + '/preload.js'
    }
  });

  win.loadFile('src/ui/loginPage/index.html'); 




}

app.whenReady().then(createWindow);