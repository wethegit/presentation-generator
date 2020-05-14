import React from "react";
import { useParams } from "react-router-dom";

export default function ProjectPage() {
  let { projectId } = useParams();

  return (
    <div>
      <h3>{projectId}</h3>
    </div>
  );
}
