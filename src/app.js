import "./stylesheets/main.css";

// Small helpers you might want to keep
import "./helpers/context_menu.js";
import "./helpers/external_links.js";

// ----------------------------------------------------------------------------
// Everything below is just to show you how it works. You can delete all of it.
// ----------------------------------------------------------------------------
import * as pug from "pug";
import { remote } from "electron";
import jetpack from "fs-jetpack";
// import env from "env";
import DropZone from './dropzone/dropzone';

const dialog = remote.dialog;
const app = remote.app;
const appDir = jetpack.cwd(app.getAppPath());

// Holy crap! This is browser window with HTML and stuff, but I can read
// files from disk like it's node.js! Welcome to Electron world :)
const manifest = appDir.read("package.json", "json");

// Show the app
const appElement = document.querySelector("#app");
appElement.style.display = "block";

const feedbackElement = appElement.querySelector('.app__feedback');
feedbackElement.addEventListener('click', function() {
  feedbackElement.style.display = 'none';
});

const giveFeedback = function(message) {
  feedbackElement.style.display = 'flex';
  feedbackElement.innerHTML = message;
}

// set dropzone
const dropzone = new DropZone(document.getElementById('dropzone'));
const acceptedFolders = ['mobile', 'tablet', 'desktop'];
const ignore = ['.DS_Store'];

// sanity check of the folder structure
dropzone.onTreeUpdate = function (tree, rootNode) {
  let passCheck = false;
  let cleanData = {};

  console.log(rootNode)

  for (let [folder, files] of Object.entries(tree[rootNode.name])) {
    if (acceptedFolders.indexOf(folder) >= 0) {
      cleanData[folder] = cleanData[folder] || {};

      for (let [filename, fileData] of Object.entries(files)) {
        if (ignore.indexOf(filename) < 0) {
          passCheck = true;
          cleanData[folder][filename] = fileData;
        }
      }
    }
  }

  console.log(cleanData)

  if (!passCheck) {
    giveFeedback('Folder structure is wrong');
    return;
  }

  let compiledFunction;
  try {
    compiledFunction = pug.compileFile(appDir.path("app/template.pug"));
  } catch (error) {
    giveFeedback('Error while compiling template.');
    console.log(error)
    return;
  }

  const data = {
    tree: {
      ...cleanData
    },
  };

  let htmlString;
  try {
    htmlString = compiledFunction(data);
  } catch (error) {
    giveFeedback('Error while generating HTML.');
    console.log(error);
    return;
  }

  dialog.showSaveDialog({
    title: 'Save file',
    defaultPath: `${rootNode.fullPath}/index.html`
  }, (filename) => {
    // console.log(filename)
    jetpack.write(filename, htmlString);
  })

  console.log(htmlString)
}
