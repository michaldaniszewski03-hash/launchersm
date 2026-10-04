const { app, BrowserWindow, shell } = require('electron');

const URL = 'https://launcher.silvermonkey.com';
const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36';

app.userAgentFallback = UA;

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    autoHideMenuBar: true,
    title: 'SMX Launcher',
  });

  const ses = win.webContents.session;
  ses.setUserAgent(UA);

  // Allow device access (HID / USB / serial) without extra prompts
  ses.setPermissionCheckHandler(() => true);
  ses.setPermissionRequestHandler((_wc, _perm, cb) => cb(true));
  ses.setDevicePermissionHandler(() => true);

  // Auto-pick the first matching device. Works best with one device plugged in.
  ses.on('select-hid-device', (event, details, callback) => {
    event.preventDefault();
    callback(details.deviceList[0]?.deviceId);
  });
  ses.on('select-usb-device', (event, details, callback) => {
    event.preventDefault();
    callback(details.deviceList[0]?.deviceId);
  });
  ses.on('select-serial-port', (event, portList, _wc, callback) => {
    event.preventDefault();
    callback(portList[0]?.portId ?? '');
  });

  // Open external links in the default browser
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (!url.startsWith(URL)) {
      shell.openExternal(url);
      return { action: 'deny' };
    }
    return { action: 'allow' };
  });

  win.loadURL(URL, { userAgent: UA });
}

app.whenReady().then(createWindow);
app.on('window-all-closed', () => app.quit());
