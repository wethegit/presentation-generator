// This is main process of Electron, started as first thing when your
// app starts. It runs through entire life of your application.
// It doesn't have any windows which you can see on screen, but we can open
// window from here.

import path from "path";
import url from "url";
import { app, Menu } from "electron";
import { autoUpdater } from "electron-updater";
import log from "electron-log";
import { devMenuTemplate } from "./menu/dev_menu_template";
import { editMenuTemplate } from "./menu/edit_menu_template";
import { updateMenuTemplate } from "./menu/update_menu_template";
import createWindow from "./helpers/window";
import Store from "./store/store";

// Special module holding environment variables which you declared
// in config/env_xxx.json file.
import env from "env";

// First instantiate the class
const store = new Store({
  // We'll call our data file 'user-preferences'
  configName: "user-preferences",
  defaults: {
    // 800x600 is the default size of our window
    windowBounds: { width: 846, height: 582 }
  }
});

// Set up logger
autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = "info";
log.info("App starting...");

const setApplicationMenu = () => {
  const menus = [editMenuTemplate];

  if (process.platform === "darwin") {
    // OS X
    menus.unshift(updateMenuTemplate);
  }

  if (env.name !== "production") {
    menus.push(devMenuTemplate);
  }

  Menu.setApplicationMenu(Menu.buildFromTemplate(menus));
};

// Save userData in separate folders for each environment.
// Thanks to this you can use production and development versions of the app
// on same machine like those are two separate apps.
if (env.name !== "production") {
  const userDataPath = app.getPath("userData");
  app.setPath("userData", `${userDataPath} (${env.name})`);
}

app.on("ready", () => {
  // First we'll get our height and width. This will be the defaults if there wasn't anything saved
  let { width, height } = store.get("windowBounds");

  setApplicationMenu();

  const mainWindow = createWindow("main", {
    width,
    height,
    webPreferences: {
      nodeIntegration: true
    }
  });

  // The BrowserWindow class extends the node.js core EventEmitter class, so we use that API
  // to listen to events on the BrowserWindow. The resize event is emitted when the window size changes.
  mainWindow.on("resize", () => {
    // The event doesn't pass us the window size, so we call the `getBounds` method which returns an object with
    // the height, width, and x and y coordinates.
    let { width, height } = mainWindow.getBounds();
    // Now that we have them, save them using the `set` method.
    store.set("windowBounds", { width, height });
  });

  mainWindow.loadURL(
    url.format({
      pathname: path.join(__dirname, "app.html"),
      protocol: "file:",
      slashes: true
    })
  );

  if (env.name === "development") {
    mainWindow.openDevTools();
  }

  autoUpdater.checkForUpdatesAndNotify();
});

app.on("window-all-closed", () => {
  app.quit();
});
