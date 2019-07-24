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
const feedbackElement = document.querySelector('.feedback');
const feedbackMessage = feedbackElement.querySelector('.feedback__message');
const acceptedFolders = ['mobile', 'tablet', 'desktop', 'intro'];
const appForm = appElement.querySelector('.form');
const ignore = ['.DS_Store'];

let defaultPath = store.get('dropzone_path');
let feedbackDelay = null;
let state = 'idle';

const giveFeedback = function(message, autoRemove = true) {
  clearTimeout(feedbackDelay);
  feedbackElement.classList.add('is-visible');
  feedbackMessage.innerHTML = message;

  if (autoRemove) {
    feedbackDelay = setTimeout(() => {
      feedbackElement.classList.remove('is-visible');
    }, 2000);
  }
}

const setState = function(value) {
  appElement.classList.remove(`is-${state}`);
  state = value;
  if (value)
    appElement.classList.add(`is-${state}`);
}

const onSubmit = function(event) {
  event.preventDefault();

  if (state === 'processing') return;

  const selectedFolder = dialog.showOpenDialog({
    title: "Select a folder",
    defaultPath: defaultPath || null,
    properties: ['openDirectory']
  });

  if (selectedFolder) {
    setState('processing');
    giveFeedback('Processing...', false);

    defaultPath = selectedFolder[0];
    store.set('defaultPath', { defaultPath: defaultPath });

    let tree = {};
    tree.folders = sanitizeFolder(jetpack.inspectTree(defaultPath));

    const formData = new FormData(appForm);
    for (let [key, value] of formData.entries()) {
      tree[key] = value;
    }

    console.log(tree);
    generateTemplate(tree);
  }
}

// sanity check of the folder structure
const sanitizeFolder = function (tree) {
  let passCheck = false;
  let cleanData = {};

  for (let child of tree.children) {
    if (acceptedFolders.indexOf(child.name.toLowerCase()) >= 0) {
      if (child.children) {
        cleanData[child.name] = cleanData[child.name] || [];

        for (let file of child.children) {
          if (ignore.indexOf(file.name) < 0) {
            passCheck = true;
            cleanData[child.name].push({
              ...file,
              fullPath: `./${child.name}/${file.name}`,
              displayName: file.name.match(/([A-z])\w+/g)[0].replace('_', ' ')
            });
          }
        }
      }
    }
  }

  if (!passCheck) {
    giveFeedback('Folder structure is wrong');
    return;
  }

  return cleanData;
}

const generateTemplate = function (tree) {
  let compiledFunction;
  try {
    compiledFunction = pug.compileFile(appDir.path("app/template.pug"));
  } catch (error) {
    giveFeedback('Error while compiling template, try again.');
    console.log(error);
    return;
  }

  const data = {
    ...tree
  };

  let htmlString;
  try {
    htmlString = compiledFunction(data);
  } catch (error) {
    giveFeedback('Error while generating HTML, please try again.');
    console.log(error);
    return;
  }

  dialog.showSaveDialog({
    title: 'Save file',
    defaultPath: `${defaultPath}/index.html`
  }, (filename) => {
    if (filename) {
      console.log(filename);
      jetpack.write(filename, htmlString);
    }

    giveFeedback('All done ✌️');
    setState('');
  });
}

// show app and add event listener
appElement.style.display = "flex";

appForm.addEventListener('submit', onSubmit);
