// Helpers
const createElement = function(tag, classes, attributes) {
  const el = document.createElement(tag);

  if (classes) {
    for (let className of classes.split(",")) {
      el.classList.add(className);
    }
  }

  if (attributes) {
    for (let [key, value] of Object.entries(attributes)) {
      el.setAttribute(key, value);
    }
  }

  return el;
};

const getFirstPageFirstConcept = function(withCurrentBreakpoint) {
  const conceptId = Object.keys(tree.concepts)[0];
  const concept = tree.concepts[conceptId];

  if (!withCurrentBreakpoint) {
    return Object.keys(concept.pages)[0];
  } else {
    let result;
    for (let [pageId, page] of Object.entries(concept.pages)) {
      if (page.breakpoints.indexOf(currentBreakpoint) >= 0) {
        result = pageId;
        break;
      }
    }

    return result;
  }
};

//
const INTRO = document.querySelector(".intro");
const SHOWCASE = document.querySelector(".showcase");
const SHOWCASE_IMAGE = SHOWCASE.querySelector(".showcase__image");
const SIDEBAR = document.querySelector(".sidebar");
let tree = JSON.parse(window.TREE);
let currentBreakpoint, currentPage, currentConcept;

const initConcepts = async function() {
  const CONCEPTS = document.querySelector(".concepts");

  let ul = createElement("ul", "concepts__list");
  CONCEPTS.appendChild(ul);

  // creates the list of concepts and pages
  for (let [key, value] of Object.entries(tree.concepts)) {
    // concept item
    let li = createElement("li", "concepts__list-item");
    ul.appendChild(li);

    // concept button
    // if the concept doesnt have a moodboard, we want a simple 'p'
    let button;
    if (!value.moodboard) button = createElement("p");
    else {
      // on click to go moodboard
      button = createElement("button");
      button.addEventListener("click", function() {
        goToMoodboard(key);
      });
    }

    button.classList.add("concepts__button");
    button.innerHTML = value.displayName;
    li.appendChild(button);

    // creates the list pages
    const pagesUl = createElement(
      "ul",
      "concepts__list,concepts__list--nested"
    );
    li.appendChild(pagesUl);

    for (let [pageId, page] of Object.entries(value.pages)) {
      // page item
      let li = createElement(
        "li",
        "concepts__list-item,concepts__list-item--nested"
      );
      pagesUl.appendChild(li);

      // page button
      let button = createElement(
        "button",
        "concepts__button,concepts__button--page"
      );
      button.innerHTML = page.displayName;
      button.addEventListener("click", function() {
        goToPage(pageId);
      });

      li.appendChild(button);
      // save the button on the tree
      tree.concepts[key].pages[pageId].button = button;
    }
  }
};

const initBreakpoints = function() {
  // goes throught the list of breakpoints and add the event listener
  for (button of SIDEBAR.querySelectorAll(".breakpoints__button")) {
    const bp = button.getAttribute("data-breakpoint");

    // if the tree contains the breakpoint
    if (tree.breakpoints.indexOf(bp) >= 0) {
      button.classList.remove("is-inactive");
      button.removeAttribute("disabled");
      button.addEventListener("click", function() {
        goToBreakpoint(bp);
      });
    }
  }
};

const goToMoodboard = function(conceptId) {
  console.log(tree.concepts[conceptId]);
};

const goToPage = function(pageId) {
  if (pageId === "next" || pageId === "prev") {
    // next page
    const pageKeys = Object.keys(tree.concepts[currentConcept].pages);
    const nextKey =
      pageKeys[pageKeys.indexOf(currentPage) + (pageId === "next" ? 1 : -1)];

    if (
      nextKey &&
      tree.concepts[currentConcept].pages[nextKey].breakpoints[
        currentBreakpoint
      ]
    )
      pageId = nextKey;
    else {
      const conceptKeys = Object.keys(tree.concepts);
      const nextConceptKey =
        conceptKeys[
          conceptKeys.indexOf(currentConcept) + (pageId === "next" ? 1 : -1)
        ];

      if (!nextConceptKey) return;

      const pageKeys = Object.keys(tree.concepts[nextConceptKey].pages);
      pageId = pageKeys[pageId === "next" ? 0 : pageKeys.length - 1];
    }
  }

  // toggle classes
  if (currentPage) {
    const page = tree.concepts[currentConcept].pages[currentPage];
    page.button.classList.remove("is-active");
    console.log(Object.keys(page.breakpoints).indexOf(currentBreakpoint));
    if (Object.keys(page.breakpoints).indexOf(currentBreakpoint) >= 0) {
      page.button.removeAttribute("disabled");
    } else {
      page.button.setAttribute("disabled", true);
    }
  }

  // change image and toggle class
  const page = tree.concepts[currentConcept].pages[pageId];
  SHOWCASE_IMAGE.setAttribute(
    "src",
    page.breakpoints[currentBreakpoint].fullPath
  );
  page.button.classList.add("is-active");
  page.button.setAttribute("disabled", true);

  // saves id
  currentPage = pageId;
};

const goToBreakpoint = function(breakpointId) {
  // if it's the same or we don't have a page with the breakpoint
  if (
    breakpointId === currentBreakpoint ||
    tree.breakpoints.indexOf(breakpointId) < 0
  )
    return;

  // toggle some classes
  if (currentBreakpoint) {
    const button = document.querySelector(
      `.breakpoints__button[data-breakpoint="${currentBreakpoint}"]`
    );
    button.classList.remove("is-active");
    button.removeAttribute("disabled");

    SHOWCASE.classList.remove(`showcase--${currentBreakpoint}`);
  }

  const button = document.querySelector(
    `.breakpoints__button[data-breakpoint="${breakpointId}"]`
  );
  button.classList.add("is-active");
  button.setAttribute("disabled", true);

  SHOWCASE.classList.add(`showcase--${breakpointId}`);

  // saves it
  currentBreakpoint = breakpointId;

  // if we are on a moodboard currentPage is empty
  if (!currentPage) return;

  let nextPage;
  // go through the list of pages and disable the buttons that don't have this breakpoint
  // also save a fallback page to use in case the currentPage doesn't have this breakpoint
  for (let [key, value] of Object.entries(tree.concepts)) {
    for (let [pageId, page] of Object.entries(value.pages)) {
      if (Object.keys(page.breakpoints).indexOf(breakpointId) < 0) {
        console.log(page);
        page.button.setAttribute("disabled", true);
      } else {
        page.button.removeAttribute("disabled", true);
      }

      if (!nextPage && key === currentConcept) nextPage = pageId;
    }
  }

  // if the currentPage contains the breakpoint
  if (
    tree.concepts[currentConcept].pages[currentPage].breakpoints[breakpointId]
  ) {
    goToPage(currentPage);
  } else {
    goToPage(nextPage);
  }
};

const begin = function() {
  // hide intro and show showcase
  INTRO.classList.toggle("screen--hidden");
  SHOWCASE.classList.toggle("screen--hidden");

  // if the first concept has a moodboard go to it
  const key = Object.keys(tree.concepts)[0];
  const value = tree.concepts[key];
  if (value.moodboard) {
    goToMoodboard(key);
    return;
  }

  // ... else if the tree contains a desktop page go to it
  currentConcept = Object.keys(tree.concepts)[0];
  currentPage = getFirstPageFirstConcept();
  if (tree.breakpoints.indexOf("desktop")) {
    goToBreakpoint("desktop");
    return;
  }

  // ... otherwise go to the first breakpoint available
  goToBreakpoint(tree.breakpoints[0]);
};

const toggleSidebar = function() {
  SIDEBAR.classList.toggle("sidebar--hidden");
};

const handleKeyUp = function(event) {
  const keyCode = event.keyCode;
  console.log(keyCode);
  switch (keyCode) {
    // 1
    case 49:
      goToBreakpoint("desktop");
      break;

    // 2
    case 50:
      goToBreakpoint("tablet");
      break;

    // 3
    case 51:
      goToBreakpoint("mobile");
      break;

    // right
    case 39:
      goToPage("next");
      break;

    // left
    case 37:
      goToPage("prev");
      break;

    default:
      break;
  }
};

const init = async function() {
  // initiate the list of concepts
  await initConcepts();
  // initiate the breakpoints
  initBreakpoints();

  // begin button
  const INTRO_BEGIN = INTRO.querySelector(".intro__begin");
  INTRO_BEGIN.addEventListener("click", begin);

  // sidebar toggler
  const SIDEBAR_TOGGLER = SIDEBAR.querySelector(".sidebar__toggler");
  SIDEBAR_TOGGLER.addEventListener("click", toggleSidebar);

  document.addEventListener("keyup", handleKeyUp);
};

// Start
init();
