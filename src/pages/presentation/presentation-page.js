import React, { useState, useMemo } from "react";
import gql from "graphql-tag";
import { useParams } from "react-router-dom";
import { useQuery } from "@apollo/react-hooks";
import { Storage } from "aws-amplify";

import PageLayout from "../../containers/page-layout/page-layout.js";

import Button from "../../components/button/button.js";

import { projectsBySlug } from "../../graphql/queries.js";

import { classnames } from "../../utils/helpers.js";
import { PAGE_SIZES } from "../../utils/consts";

import styles from "./presentation.module.scss";

const DEFAULT_SIZE = PAGE_SIZES[2]; // large
const AVAILABLE_SIZES = [];

export default function CreateProjectPage() {
  const { projectSlug } = useParams();
  const { error } = useQuery(gql(projectsBySlug), {
    variables: { slug: projectSlug },
    onCompleted: async (data) => {
      if (
        !data ||
        !data.projectsBySlug.items ||
        data.projectsBySlug.items.length <= 0
      ) {
        setState((cur) => {
          return { ...cur, loading: false };
        });

        return;
      }

      const project = data.projectsBySlug.items[0];
      if (project.logo) {
        const url = await Storage.get(project.logo.key, {
          identityId: project.logo.identityId,
        });

        project.logo.url = url;
      }

      if (project.concepts) {
        for (let concept of project.concepts.items) {
          if (concept.moodboard) {
            const url = await Storage.get(concept.moodboard.key, {
              identityId: concept.moodboard.identityId,
            });

            concept.moodboard.url = url;
          }

          if (concept.pages) {
            for (let page of concept.pages.items) {
              if (page.variants) {
                for (let variant of page.variants.items) {
                  if (variant.image) {
                    const url = await Storage.get(variant.image.key, {
                      identityId: variant.image.identityId,
                    });

                    variant.image.url = url;
                  }

                  if (!AVAILABLE_SIZES.includes(variant.size))
                    AVAILABLE_SIZES.push(variant.size);
                }
              }
            }
          }
        }
      }

      setState((cur) => {
        return { ...cur, loading: false };
      });
      setProject(project);
    },
  });
  const [project, setProject] = useState(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const [state, setState] = useState({
    loading: true,
    screen: "intro",
    conceptIndex: null,
    pageIndex: null,
    variantIndex: null,
  });
  const active = useMemo(() => {
    const { conceptIndex, pageIndex, variantIndex, screen } = state;
    let active = {
      concept: null,
      page: null,
      variant: null,
      imageSrc: null,
    };

    if (project && conceptIndex !== null) {
      active.concept = project.concepts.items[conceptIndex];

      if (pageIndex !== null) {
        active.page = active.concept.pages.items[pageIndex];

        if (variantIndex !== null) {
          active.variant = active.page.variants.items[variantIndex];

          if (screen === "page") active.imageSrc = active.variant.image.url;
        }
      }

      if (screen === "moodboard")
        active.imageSrc = active.concept.moodboard.url;
    }

    return active;
  }, [project, state]);

  const toggleSidebar = () => {
    setShowSidebar((cur) => !cur);
  };

  const goToMoodboard = (conceptIndex) => {
    if (!project.concepts.items[conceptIndex].moodboard) return;

    setState({
      conceptIndex,
      screen: "moodboard",
      pageIndex: null,
      variantIndex: null,
    });
  };

  const goToSize = (size) => {
    let { conceptIndex, pageIndex, variantIndex } = state;

    // we don't have a concept selected so we go through it and find the first one with a page and variant of the selected size
    console.log(state);
    if (pageIndex === null) {
      for (let i = 0; i < project.concepts.items.length; i++) {
        const pages = project.concepts.items[i].pages.items;

        for (let j = 0; j < pages.length; j++) {
          const variants = pages[j].variants.items;

          for (let k = 0; k < variants.length; k++) {
            const variant = variants[k];

            if (variant.size === size) {
              conceptIndex = i;
              pageIndex = j;
              variantIndex = k;

              break;
            }
          }

          if (pageIndex !== null) break;
        }

        if (conceptIndex !== null) break;
      }
    } else {
      const variants =
        project.concepts.items[conceptIndex].pages.items[pageIndex].variants
          .items;

      for (let i = 0; i < variants.length; i++) {
        const variant = variants[i];

        if (variant.size !== size) continue;

        variantIndex = i;
        break;
      }
    }

    setState({
      screen: "page",
      conceptIndex,
      pageIndex,
      variantIndex,
    });
  };

  const goToPage = (conceptIndex, pageIndex) => {
    let { variant } = active;

    // no size set use default
    const size = variant ? variant.size : DEFAULT_SIZE;
    const variants =
      project.concepts.items[conceptIndex].pages.items[pageIndex].variants
        .items;
    // find variant of set size
    let variantIndex = null;
    for (let i = 0; i < variants.length; i++) {
      if (variants[i].size !== size) continue;
      variantIndex = i;
      break;
    }

    // can't find a variant of the set size use the first one and update size
    if (variantIndex === null) variantIndex = 0;

    setState({
      screen: "page",
      conceptIndex,
      pageIndex,
      variantIndex,
    });
  };

  const onClickBegin = function () {
    // if the first concept has a moodboard go to it
    const concept = project.concepts.items[0];
    if (concept.moodboard) {
      goToMoodboard(0);
    } else {
      // ... else if the tree contains a desktop page go to it
      if (AVAILABLE_SIZES.includes("Large")) {
        goToSize("desktop");
      }

      // ... otherwise go to the first breakpoint available
      goToSize(AVAILABLE_SIZES[0]);
    }
  };

  // define some consts to help
  const { loading, screen } = state;

  return (
    <PageLayout
      className={styles.PresentationPage}
      innerClassName={styles.PresentationPage__wrapper}
      noNavigation={true}
      noFooter={true}
    >
      {/* loading current project entry */}
      {loading && <p>Loading</p>}

      {/* errors from current entry */}
      {error && <p>Error: {error.message}</p>}

      {/* no data returned */}
      {!loading && !project && <p>No project found</p>}

      {/* if we got data then we can finally edit */}
      {project && (
        <>
          {screen === "intro" && (
            <div className={classnames([styles.screen, styles.intro])}>
              {project.logo && (
                <img
                  className={styles.intro__logo}
                  src={project.logo.url}
                  alt=""
                />
              )}
              <h1 className={styles.intro__title}>{project.title}</h1>
              <h2 className={styles.intro__client}>{project.client}</h2>
              <h3 className={styles.intro__date}>
                Created: {new Date(project.createdAt).toDateString()}
              </h3>
              <h3 className={styles.intro__date}>
                Updated: {new Date(project.updatedAt).toDateString()}
              </h3>
              <Button onClick={onClickBegin} className={styles.intro__begin}>
                Begin
              </Button>
            </div>
          )}
          <div
            className={classnames([
              styles.sidebar,
              !showSidebar && styles["sidebar--hidden"],
            ])}
          >
            <button className={styles.sidebar__toggler} onClick={toggleSidebar}>
              <svg
                className={styles["sidebar__toggler-icon"]}
                viewBox="0 0 7 11"
              >
                <title>Toggle Sidebar</title>
                <path
                  d="M5.5 1L1 5.5 5.5 10"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                  fillRule="evenodd"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                ></path>
              </svg>
            </button>
            <div className={styles.sidebar__wrapper}>
              <nav
                className={classnames([
                  styles.sidebar__nav,
                  styles.breakpoints,
                ])}
              >
                <ul className={styles.breakpoints__list}>
                  {PAGE_SIZES.filter((size) =>
                    AVAILABLE_SIZES.includes(size)
                  ).map((size) => {
                    const isActive =
                      active.variant && active.variant.size === size;

                    // it is disabled if the current page doesn't have any variants of the size
                    const isDisabled =
                      active.page &&
                      !active.page.variants.items.find(
                        (variant) => variant.size === size
                      );

                    return (
                      <li
                        key={`size-list-item-${size}`}
                        className={styles["breakpoints__list-item"]}
                      >
                        <button
                          className={classnames([
                            styles.button,
                            styles.breakpoints__button,
                            isDisabled && styles["is-inactive"],
                          ])}
                          disabled={isActive || isDisabled}
                          onClick={() => goToSize(size)}
                        >
                          <svg
                            className={styles.breakpoints__icon}
                            viewBox="0 0 60 60"
                          >
                            <title>{size}</title>
                            {size === "Large" && (
                              <path
                                d="M15.197 21.256h29.58v17.786h-29.58zM26.043 43.006h7.888M29.987 39.041v3.965"
                                fill="none"
                                stroke="currentColor"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                              />
                            )}
                            {size === "Medium" && (
                              <path
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinejoin="round"
                                d="M19 15h23v30H19z"
                                fill="none"
                              />
                            )}

                            {size === "Small" && (
                              <>
                                <path
                                  fill="none"
                                  d="M36.844 45H22.99a.995.995 0 0 1-.99-1V16c0-.552.443-1 .99-1h13.854c.546 0 .99.448.99 1v28c0 .552-.444 1-.99 1z"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                                <path
                                  d="M34.25 20a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5z"
                                  fill="currentColor"
                                />
                              </>
                            )}
                          </svg>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </nav>
              {project.concepts && project.concepts.items.length > 0 && (
                <nav
                  className={classnames([styles.sidebar__nav, styles.concepts])}
                  aria-label="Concepts"
                >
                  <ul className={styles.concepts__list}>
                    {project.concepts.items.map((concept, conceptIndex) => (
                      <li
                        key={`concept-${concept.id}`}
                        className={styles["concepts__list-item"]}
                      >
                        {concept.moodboard ? (
                          <button
                            className={classnames([
                              styles.concepts__button,
                              conceptIndex === state.conceptIndex &&
                                styles["is-active"],
                            ])}
                            disabled={conceptIndex === state.conceptIndex}
                            onClick={() => goToMoodboard(conceptIndex)}
                          >
                            {concept.name}
                          </button>
                        ) : (
                          <p
                            className={classnames([
                              styles.concepts__button,
                              conceptIndex === state.conceptIndex &&
                                styles["is-active"],
                            ])}
                          >
                            {concept.name}
                          </p>
                        )}
                        {concept.pages.items.length > 0 && (
                          <ul
                            className={classnames([
                              styles.concepts__list,
                              styles["concepts__list--nested"],
                            ])}
                          >
                            {concept.pages.items.map((page, pageIndex) => {
                              const isActive =
                                conceptIndex === state.conceptIndex &&
                                pageIndex === state.pageIndex;

                              const isDisabled =
                                active.variant &&
                                !page.variants.items.find(
                                  (variant) =>
                                    variant.size === active.variant.size
                                );

                              return (
                                <li
                                  key={`page-${page.id}`}
                                  className={classnames([
                                    styles["concepts__list-item"],
                                    styles["concepts__list-item--nested"],
                                  ])}
                                >
                                  <button
                                    className={classnames([
                                      styles.concepts__button,
                                      styles["concepts__button--page"],
                                      isActive && styles["is-active"],
                                    ])}
                                    disabled={isActive || isDisabled}
                                    onClick={() =>
                                      goToPage(conceptIndex, pageIndex)
                                    }
                                  >
                                    {page.name}
                                  </button>
                                </li>
                              );
                            })}
                          </ul>
                        )}
                      </li>
                    ))}
                  </ul>
                </nav>
              )}
              {/* <img
                className={styles.sidebar__logo}
                src="presentation-assets/logo.svg"
                alt
              /> */}
            </div>
          </div>
          {screen !== "intro" && (
            <div
              className={classnames([
                styles.screen,
                styles.showcase,
                active.variant && styles[`showcase--${active.variant.size}`],
              ])}
            >
              <div className={styles.showcase__frame}>
                <div className={styles.showcase__content}>
                  {active.imageSrc !== null && (
                    <img
                      className={styles.showcase__image}
                      src={active.imageSrc}
                      alt=""
                    />
                  )}
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </PageLayout>
  );
}
