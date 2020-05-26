import React, { useState } from "react";
import gql from "graphql-tag";
import { useParams } from "react-router-dom";
import { useQuery } from "@apollo/react-hooks";
import { Storage } from "aws-amplify";

import PageLayout from "../../containers/page-layout/page-layout.js";

import Button from "../../components/button/button.js";

import { projectsBySlug } from "../../graphql/queries.js";

import { classnames } from "../../utils/helpers.js";

import styles from "./presentation.module.scss";

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
        setLoading(false);
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
              if (page.image) {
                const url = await Storage.get(page.image.key, {
                  identityId: page.image.identityId,
                });

                page.image.url = url;
              }
            }
          }
        }
      }

      setLoading(false);
      setProject(project);
    },
  });
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState(null);
  const [screen, setScreen] = useState("intro");

  return (
    <PageLayout
      className={styles.PresentationPage}
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
            <Button className={styles.intro__begin}>Begin</Button>
          </div>
          <div className={classnames([styles.sidebar])}>
            <button className={styles.sidebar__toggler}>
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
                aria-label="breakpoints"
              >
                <ul className={styles.breakpoints__list}>
                  <li className={styles["breakpoints__list-item"]}>
                    <button
                      className={classnames([
                        styles.button,
                        styles.breakpoints__button,
                        styles["is-inactive"],
                      ])}
                      data-breakpoint="desktop"
                      disabled
                    >
                      <svg
                        className={styles.breakpoints__icon}
                        viewBox="0 0 60 60"
                      >
                        <title>Desktop</title>
                        <path
                          d="M15.197 21.256h29.58v17.786h-29.58zM26.043 43.006h7.888M29.987 39.041v3.965"
                          fill="none"
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                        ></path>
                      </svg>
                    </button>
                  </li>
                  <li className={styles["breakpoints__list-item"]}>
                    <button
                      className={classnames([
                        styles.button,
                        styles.breakpoints__button,
                        styles["is-inactive"],
                      ])}
                      data-breakpoint="tablet"
                      disabled
                    >
                      <svg
                        className={styles.breakpoints__icon}
                        viewBox="0 0 60 60"
                      >
                        <title>Tablet</title>
                        <path
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinejoin="round"
                          d="M19 15h23v30H19z"
                          fill="none"
                        ></path>
                      </svg>
                    </button>
                  </li>
                  <li className={styles["breakpoints__list-item"]}>
                    <button
                      className={classnames([
                        styles.button,
                        styles.breakpoints__button,
                        styles["is-inactive"],
                      ])}
                      data-breakpoint="mobile"
                      disabled
                    >
                      <svg
                        className={styles.breakpoints__icon}
                        viewBox="0 0 60 60"
                      >
                        <title>Mobile</title>
                        <path
                          fill="none"
                          d="M36.844 45H22.99a.995.995 0 0 1-.99-1V16c0-.552.443-1 .99-1h13.854c.546 0 .99.448.99 1v28c0 .552-.444 1-.99 1z"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        ></path>
                        <path
                          d="M34.25 20a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5z"
                          fill="currentColor"
                        ></path>
                      </svg>
                    </button>
                  </li>
                </ul>
              </nav>
              {project.concepts && project.concepts.items.length > 0 && (
                <nav
                  className={classnames([styles.sidebar__nav, styles.concepts])}
                  aria-label="Concepts"
                >
                  <ul className={styles.concepts__list}>
                    {project.concepts.items.map((concept) => (
                      <li
                        key={`concept-${concept.id}`}
                        className={styles["concepts__list-item"]}
                      >
                        <button
                          className={classnames([
                            styles.concepts__button,
                            styles["is-active"],
                          ])}
                          disabled={true}
                        >
                          {concept.name}
                        </button>
                        {concept.pages.items.length > 0 && (
                          <ul
                            className={classnames([
                              styles.concepts__list,
                              styles["concepts__list--nested"],
                            ])}
                          >
                            {concept.pages.items.map((page) => (
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
                                  ])}
                                >
                                  {page.name}
                                </button>
                              </li>
                            ))}
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
          <div
            className={classnames([
              styles.screen,
              styles["screen--hidden"],
              styles.showcase,
            ])}
          >
            <div className={styles.showcase__frame}>
              <div className={styles.showcase__content}>
                <img className={styles.showcase__image} src="" alt="" />
              </div>
            </div>
          </div>
        </>
      )}
    </PageLayout>
  );
}
