import * as pug from "pug";
import { remote } from "electron";
import jetpack from "fs-jetpack";
// import env from "env";
import Store from './store/store';

// menus
import "./helpers/context_menu.js";
import "./helpers/external_links.js";

// Main styles
import "./stylesheets/main.css";

const dialog = remote.dialog;
const app = remote.app;
const store = new Store({
  configName: 'app',
  defaults: {
    defautPath: '/'
  }
});

// Holy crap! This is browser window with HTML and stuff, but I can read
// files from disk like it's node.js! Welcome to Electron world :)
const appDir = jetpack.cwd(app.getAppPath());

// Start of the app
const appElement = document.querySelector("#app");
const feedbackElement = appElement.querySelector('.app__feedback');
const acceptedFolders = ['mobile', 'tablet', 'desktop'];
const ignore = ['.DS_Store'];

let defaultPath = store.get('dropzone_path');
let feedbackDelay = null;
let tree = null;
let state = 'idle';

const giveFeedback = function(message) {
  clearTimeout(feedbackDelay);
  feedbackElement.innerHTML = message;
}

const setState = function(value) {
  appElement.classList.remove(`is-${state}`);
  state = value;
  appElement.classList.add(`is-${state}`);
}

const onClick = function() {
  if (state === 'processing') return;

  const selectedFolder = dialog.showOpenDialog({
    title: "Select a folder",
    defaultPath: defaultPath || null,
    properties: ['openDirectory']
  });

  if (selectedFolder) {
    setState('processing');
    giveFeedback('Processing...')

    defaultPath = selectedFolder[0];
    store.set('defaultPath', { defaultPath: defaultPath });

    tree = jetpack.inspectTree(defaultPath);
    console.log(tree);
  }
}

// sanity check of the folder structure
const onTreeUpdate = function (tree, rootNode) {
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
}

const generateTemplate = function (tree, rootNode) {
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

// Set initial feedback
giveFeedback('Click and pick a folder 👆');

// show app and add event listener
appElement.style.display = "flex";
appElement.addEventListener('click', onClick);
