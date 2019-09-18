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
  const concept = tree.concepts[0];

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

const setState = function(newState) {
  _state = Object.assign({}, _state, newState);
}

const getState = function() {
  const isMoodboard = _state.pageId === 'moodboard';

  return {
    ..._state,
    concept: tree.concepts[_state.conceptIndex],
    [isMoodboard ? 'moodboard' : 'page']: isMoodboard ? tree.concepts[_state.conceptIndex].moodboard : tree.concepts[_state.conceptIndex].pages[_state.pageId],
  }
}

//
const INTRO = document.querySelector(".intro");
const SHOWCASE = document.querySelector(".showcase");
const SHOWCASE_IMAGE = SHOWCASE.querySelector(".showcase__image");
const SIDEBAR = document.querySelector(".sidebar");

let tree = JSON.parse(window.TREE); console.log(tree);
let _state = {
  conceptIndex: 0,
  pageId: 0,
  breakpoint: null
}

const initConcepts = async function() {
  const CONCEPTS = document.querySelector(".concepts");

  let ul = createElement("ul", "concepts__list");
  CONCEPTS.appendChild(ul);

  // creates the list of concepts and pages
  tree.concepts.forEach(function(concept, index) {
    // concept item
    let li = createElement("li", "concepts__list-item");
    ul.appendChild(li);

    // concept button
    // if the concept doesnt have a moodboard, we want a simple 'p'
    let button;
    if (!concept.moodboard) button = createElement("p");
    else {
      // on click to go moodboard
      button = createElement("button");
      button.addEventListener("click", function() {
        goToMoodboard(index);
      });

      // save moodboard infor and button
      concept.moodboard = {
        path: concept.moodboard,
        button: button
      };
    }

    // base buttons styles
    button.classList.add("concepts__button");
    button.innerHTML = concept.displayName;
    li.appendChild(button);

    // creates the list pages
    const pagesUl = createElement(
      "ul",
      "concepts__list,concepts__list--nested"
    );
    li.appendChild(pagesUl);

    for (let [pageId, page] of Object.entries(concept.pages)) {
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
        goToPage(index, pageId);
      });

      li.appendChild(button);
      // save the button on the tree
      concept.pages[pageId].button = button;
    }
  });
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

const resetMoodboardButtons = function() {
  const { moodboard, conceptIndex } = getState();

  tree.concepts.forEach(function(concept, index) {
    if (moodboard) {
      if (index === conceptIndex) {
        concept.moodboard.button.setAttribute('disabled', true);
        concept.moodboard.button.classList.add('is-active');
      }
      else {
        concept.moodboard.button.classList.remove('is-active');
        concept.moodboard.button.removeAttribute('disabled');
      }
    }
  });
}

const resetConceptButtons = function() {
  const { breakpoint, pageId, conceptIndex, moodboard } = getState();

  if (moodboard) {
    tree.concepts.forEach(function(concept, index) {
      for (let [id, page] of Object.entries(concept.pages)) {
        page.button.removeAttribute("disabled");
        page.button.classList.remove("is-active");
      }
    });
  }
  else {
    // go through the list of pages and disable the buttons that don't have this breakpoint
    // also save a fallback page to use in case the currentPage doesn't have this breakpoint
    tree.concepts.forEach(function(concept, index) {
      for (let [id, page] of Object.entries(concept.pages)) {
        const isActive = id === pageId && index === conceptIndex;

        if (isActive) {
          page.button.setAttribute("disabled", true);
          page.button.classList.add("is-active");
        } else if (!page.breakpoints[breakpoint]) {
          page.button.classList.remove("is-active");
          page.button.setAttribute("disabled", true);
        }
        else {
          page.button.removeAttribute("disabled");
          page.button.classList.remove("is-active");
        }
      }
    });
  }
}

const resetBreakpointButtons = function() {
  const { breakpoint } = getState();

  for(let button of document.querySelectorAll('.breakpoints__button')) {
    if (breakpoint && breakpoint === button.getAttribute('data-breakpoint')) {
      button.classList.add("is-active");
      button.setAttribute("disabled", true);
    }
    else {
      button.classList.remove("is-active");
      button.removeAttribute("disabled");
    }
  }
}

const resetButtons = function() {
  resetMoodboardButtons();
  resetConceptButtons();
  resetBreakpointButtons();
}

const goToMoodboard = function(index) {
  const { conceptIndex, breakpoint } = getState();

  // no concept we use the current one
  if (index === undefined) index = conceptIndex;

  const concept = tree.concepts[index];
  // return if it doesn't have a moodboard
  if (!concept.moodboard) return;

  if (breakpoint)
    SHOWCASE.classList.remove(`showcase--${breakpoint}`);

  SHOWCASE.classList.add('showcase--moodboard');

  const mood = concept.moodboard;
  SHOWCASE_IMAGE.setAttribute(
    "src",
    mood.path
  );

  setState({
    conceptIndex: index,
    pageId: 'moodboard',
    breakpoint: null
  });

  resetButtons();
};

const goToPage = function(conceptIndex, pageId, breakpoint) {
  const state = getState();
  let direction, page;

  if (!pageId) pageId = state.pageId;
  if (!breakpoint) {
    if(!state.breakpoint) {
      breakpoint = 'desktop';
      goToBreakpoint(breakpoint);
    }
    else breakpoint = state.breakpoint;
  }

  const move = function() {
    // next page
    const pageKeys = Object.keys(state.concept.pages);
    const nextKey = pageKeys[pageKeys.indexOf(pageId) + direction];

    if (!nextKey) {
      const nextConceptKey = conceptIndex + direction;
      if (nextConceptKey >= tree.concepts.length) {
        conceptIndex = -1;
        return;
      }

      const pageKeys = Object.keys(tree.concepts[nextConceptKey].pages);
      pageId = pageKeys[direction > 0 ? 0 : pageKeys.length - 1];
      conceptIndex = nextConceptKey;
    }
    else pageId = nextKey;

    if (!tree.concepts[conceptIndex].pages[pageId].breakpoints[breakpoint]) move();
  }

  if (conceptIndex === "next" || conceptIndex === "prev") {
    direction = conceptIndex === "next" ? 1 : -1;
    conceptIndex = state.conceptIndex;

    move();
  }

  if (conceptIndex < 0 || !pageId) return;

  page = tree.concepts[conceptIndex].pages[pageId];

  let nextPageId;
  let fallbackPage, fallbackConcept;
  if (!page.breakpoints[breakpoint]) {
    tree.concepts.forEach((concept, index) => {
      for (let [pageId, page] of Object.entries(concept.pages)) {
        if(!fallbackPage && page.breakpoints[breakpoint]) {
          fallbackConcept = index;
          fallbackPage = pageId;
        }

        if (index === conceptIndex && page.breakpoints[breakpoint]) {
          nextPageId = pageId;
        }
      }
    });

    if (nextPageId) pageId = nextPageId;
    else {
      pageId = fallbackPage;
      conceptIndex = fallbackConcept;
    }

    page = tree.concepts[conceptIndex].pages[pageId];
  }

  // change image and toggle class
  SHOWCASE_IMAGE.setAttribute(
    "src",
    page.breakpoints[breakpoint].fullPath
  );

  // saves id
  setState({
    conceptIndex,
    pageId,
    breakpoint
  });

  resetButtons();
};

const goToBreakpoint = function(breakpointId) {
  const { breakpoint, page, conceptIndex, concept, pageId } = getState();
  // if it's the same or we don't have a page with the breakpoint
  if (
    breakpointId === breakpoint ||
    tree.breakpoints.indexOf(breakpointId) < 0
  )
    return;

  if (breakpoint)
    SHOWCASE.classList.remove(`showcase--${breakpoint}`);

  SHOWCASE.classList.add(`showcase--${breakpointId}`);

  // saves it
  setState({
    breakpoint: breakpointId
  });

  if (!page || !page.breakpoints[breakpointId])
    goToPage(conceptIndex, Object.keys(concept.pages)[0], breakpointId);
  // if the currentPage contains the breakpoint
  else
    goToPage(conceptIndex, pageId, breakpointId);

  // resetButtons();
};

const begin = function() {
  // hide intro and show showcase
  INTRO.classList.toggle("screen--hidden");
  SHOWCASE.classList.toggle("screen--hidden");

  // if the first concept has a moodboard go to it
  const concept = tree.concepts[0];
  if (concept.moodboard) {
    setState({
      conceptIndex: 0,
      pageId: 'moodboard'
    });

    goToMoodboard();
    return;
  }
  else {
    // ... else if the tree contains a desktop page go to it
    if (tree.breakpoints.indexOf("desktop")) {
      goToBreakpoint("desktop");
      return;
    }

    // ... otherwise go to the first breakpoint available
    goToBreakpoint(tree.breakpoints[0]);
  }
};

const toggleSidebar = function() {
  SIDEBAR.classList.toggle("sidebar--hidden");
};

const handleKeyUp = function(event) {
  const keyCode = event.keyCode;
  console.log(keyCode)
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

    // n
    case 78:
      toggleSidebar();
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
