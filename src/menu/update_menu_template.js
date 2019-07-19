import { app } from "electron";

// OS X
const name = app.getName();

export const updateMenuTemplate = {
  label: 'Update',
  submenu: [
    {
      label: 'About ' + name,
      role: 'about'
    },
    {
      label: 'Quit',
      accelerator: 'Command+Q',
      click() { app.quit(); }
    },
  ]
};
