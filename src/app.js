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
const appForm = appElement.querySelector('.form');

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

    let tree = {
      ...sanitizeFolder(jetpack.inspectTree(defaultPath))
    }

    const formData = new FormData(appForm);
    for (let [key, value] of formData.entries()) {
      tree[key] = value;
    }

    // save to a json file
    console.log(tree);
    jetpack.write(`${defaultPath}/index.json`, tree);

    generateTemplate(tree);
  }
}

const cleanName = function (name) {
  return capitalize(name.replace(/_/g, ' '));
}

const capitalize = function(name) {
  return name.charAt(0).toUpperCase() + name.slice(1);
}

// sanity check of the folder structure
const sanitizeFolder = function (tree) {
  const breakpoints = ['mobile', 'tablet', 'desktop'];
  const ignore = ['.DS_Store'];

  let passCheck = false;
  let cleanData = {
    "date-generated": Date.now(),
    concepts: {},
    breakpoints: {}
  };

  for (let child of tree.children) {
    // Root files
    if (child.type === "file" && ignore.indexOf(child.name) < 0) {
      if (child.name === 'logo.png') {
        cleanData.logo = true;
        continue;
      }

      continue;
    }

    if (child.name.match(/concept_([0-9])+/g)) {
      if (child.children) {
        let concept = {
          displayName: cleanName(child.name),
          pages: {}
        }

        for (let conceptChild of child.children) {
          if (conceptChild.type === "file" && ignore.indexOf(conceptChild.name) < 0) {
            if (conceptChild.name === 'moodboard.jpg') {
              concept.moodboard = true;
              continue;
            }

            continue;
          }

          if (breakpoints.indexOf(conceptChild.name.toLowerCase()) >= 0) {
            if (conceptChild.children) {
              let breakpointKey = conceptChild.name;

              if (!cleanData.breakpoints[breakpointKey]) {
                cleanData.breakpoints[breakpointKey] = {
                  displayName: cleanName(breakpointKey)
                }
              }

              for (let breakpointChild of conceptChild.children) {
                if (ignore.indexOf(breakpointChild.name) < 0) {
                  if (concept.pages[breakpointChild.name]) {
                    concept.pages[breakpointChild.name].breakpoints[breakpointKey] = {
                      ...breakpointChild
                    }
                    continue;
                  }

                  concept.pages[breakpointChild.name] = {
                    displayName: cleanName(breakpointChild.name.match(/([A-z])\w+/g)[0]),
                    // fullPath: `./${child.name}/${file.name}`,
                    breakpoints: {
                      [breakpointKey]: {
                        ...breakpointChild
                      }
                    }
                  }

                  passCheck = true;
                }
              }
            }
          }
        }

        cleanData.concepts[child.name] = concept;
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

  jetpack.write(`${defaultPath}/index.html`, htmlString);
  giveFeedback('All done ✌️');
  setState('');
}

// show app and add event listener
appElement.style.display = "flex";

appForm.addEventListener('submit', onSubmit);
