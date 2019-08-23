import * as pug from "pug";
import { remote } from "electron";
import jetpack from "fs-jetpack";
import slug from "slug";
import Store from "./store/store";

// menus
import "./helpers/context_menu.js";
import "./helpers/external_links.js";

// Main styles
import "./stylesheets/main.css";
import { start } from "repl";

const dialog = remote.dialog;
const app = remote.app;
const shell = remote.shell;
const store = new Store({
  configName: "app",
  defaults: {
    defautPath: "/"
  }
});

// Holy crap! This is browser window with HTML and stuff, but I can read
// files from disk like it's node.js! Welcome to Electron world :)
const appDir = jetpack.cwd(app.getAppPath());

// Start of the app
const appElement = document.querySelector("#app");
const feedbackElement = document.querySelector(".feedback");
const feedbackMessage = feedbackElement.querySelector(".feedback__message");
const appForm = appElement.querySelector(".form");

let defaultPath = store.get("dropzone_path");
let feedbackDelay = null;
let state = "idle";

const giveFeedback = function(message, autoRemove = true) {
  clearTimeout(feedbackDelay);
  feedbackElement.classList.add("is-visible");
  feedbackMessage.innerHTML = message;

  if (autoRemove) {
    feedbackDelay = setTimeout(() => {
      feedbackElement.classList.remove("is-visible");
    }, 2000);
  }
};

const setState = function(value) {
  appElement.classList.remove(`is-${state}`);
  state = value;
  if (value) appElement.classList.add(`is-${state}`);
};

const onSubmit = function(event) {
  event.preventDefault();

  if (state === "processing") return;

  const selectedFolder = dialog.showOpenDialog({
    title: "Select a folder",
    defaultPath: defaultPath || null,
    properties: ["openDirectory"]
  });

  if (selectedFolder) {
    setState("processing");
    giveFeedback("Processing...", false);

    defaultPath = selectedFolder[0];
    store.set("defaultPath", defaultPath);

    let tree = {
      ...sanitizeFolder(jetpack.inspectTree(defaultPath))
    };

    const formData = new FormData(appForm);
    for (let [key, value] of formData.entries()) {
      tree[key] = value;
      store.set(`form_${key}`, value);
    }

    // save to a json file
    console.log(tree);
    jetpack.write(`${defaultPath}/presentation-assets/index.json`, tree);

    // save assets
    const filesToCopy = [
      "background.jpg",
      "index.css",
      "index.js",
      "pattern.png",
      "phone-frame.png",
      "tablet-frame.png"
    ];

    for (let file of filesToCopy) {
      jetpack.copy(
        appDir.path(`app/template/${file}`),
        `${defaultPath}/presentation-assets/${file}`,
        { overwrite: true }
      );
    }

    generateTemplate(tree);
  }
};

const cleanName = function(name) {
  return capitalize(name.replace(/_/g, " "));
};

const capitalize = function(name) {
  return name.charAt(0).toUpperCase() + name.slice(1);
};

const loweCaseNoExtension = function(name) {
  return name.split(".")[0].toLowerCase();
};

// sanity check of the folder structure
const sanitizeFolder = function(tree) {
  const breakpoints = ["mobile", "tablet", "desktop"];
  const ignore = [".ds_store"];

  let passCheck = false;
  let cleanData = {
    date_generated: new Date(),
    concepts: [],
    breakpoints: []
  };

  for (let child of tree.children) {
    // Root files
    if (child.type === "file" && ignore.indexOf(child.name) < 0) {
      if (loweCaseNoExtension(child.name) === "logo") {
        cleanData.logo = true;
        continue;
      }

      continue;
    }

    if (loweCaseNoExtension(child.name).match(/concept_([0-9])+/g)) {
      if (child.children) {
        let concept = {
          displayName: cleanName(child.name),
          pages: {}
        };

        for (let conceptChild of child.children) {
          if (
            conceptChild.type === "file" &&
            ignore.indexOf(conceptChild.name.toLowerCase()) < 0
          ) {
            if (loweCaseNoExtension(conceptChild.name) === "moodboard") {
              concept.moodboard = `${child.name}/${conceptChild.name}`;
              continue;
            }

            continue;
          }

          if (
            breakpoints.indexOf(loweCaseNoExtension(conceptChild.name)) >= 0
          ) {
            if (conceptChild.children) {
              let breakpointKey = loweCaseNoExtension(conceptChild.name);

              if (cleanData.breakpoints.indexOf(breakpointKey) < 0)
                cleanData.breakpoints.push(breakpointKey);

              for (let breakpointChild of conceptChild.children) {
                if (ignore.indexOf(breakpointChild.name) < 0) {
                  const fullPath = `${child.name}/${conceptChild.name}/${breakpointChild.name}`;

                  if (concept.pages[breakpointChild.name]) {
                    concept.pages[breakpointChild.name].breakpoints[
                      breakpointKey
                    ] = {
                      fullPath,
                      ...breakpointChild
                    };
                    continue;
                  }

                  concept.pages[breakpointChild.name] = {
                    displayName: cleanName(
                      breakpointChild.name.match(/([A-z])\w+/g)[0]
                    ),
                    breakpoints: {
                      [breakpointKey]: {
                        fullPath,
                        ...breakpointChild
                      }
                    }
                  };

                  passCheck = true;
                }
              }
            }
          }
        }

        cleanData.concepts.push(concept);
      }
    }
  }

  if (!passCheck) {
    giveFeedback("Folder structure is wrong");
    setState("");
    return;
  }

  return cleanData;
};

const generateTemplate = function(tree) {
  let compiledFunction;
  try {
    const template = appDir.path("app/template/index.pug");
    let htmlString = jetpack.read(template, "utf8");

    htmlString = htmlString.replace(/##TREE##/g, JSON.stringify(tree));

    compiledFunction = pug.compile(htmlString);
  } catch (error) {
    giveFeedback("Error while compiling template, try again.");
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
    giveFeedback("Error while generating HTML, please try again.");
    setState("");
    console.log(error);
    return;
  }

  const indexPath = `${defaultPath}/${slug(tree.title)}-presentation.html`;
  jetpack.write(indexPath, htmlString);
  giveFeedback("Finished");
  shell.showItemInFolder(indexPath);
  setState("");
};

// show app and add event listener
appElement.style.display = "flex";
appForm.querySelector('.form__input[name="title"]').focus();
for (let input of appForm.querySelectorAll("input")) {
  const storeVal = store.get(`form_${input.getAttribute("name")}`);
  if (storeVal) input.value = storeVal;
}
appForm.addEventListener("submit", onSubmit);
