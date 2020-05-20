import React from "react";
import { useParams } from "react-router-dom";

import PageLayout from "../../../layouts/page/page";

import PROJECTS from "../../../data/projects.json";

export default function UpdateProjectPage() {
  const { projectId } = useParams();
  const project = PROJECTS[projectId];

  return (
    <PageLayout>
      <h3>Editing {project.title}</h3>
    </PageLayout>
  );
}
