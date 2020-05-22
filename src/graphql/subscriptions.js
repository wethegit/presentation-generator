/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const onCreateProject = /* GraphQL */ `
  subscription OnCreateProject {
    onCreateProject {
      id
      title
      slug
      client
      description
      concepts {
        items {
          id
          name
          projectID
          createdAt
          updatedAt
        }
        nextToken
      }
      createdAt
      updatedAt
    }
  }
`;
export const onUpdateProject = /* GraphQL */ `
  subscription OnUpdateProject {
    onUpdateProject {
      id
      title
      slug
      client
      description
      concepts {
        items {
          id
          name
          projectID
          createdAt
          updatedAt
        }
        nextToken
      }
      createdAt
      updatedAt
    }
  }
`;
export const onDeleteProject = /* GraphQL */ `
  subscription OnDeleteProject {
    onDeleteProject {
      id
      title
      slug
      client
      description
      concepts {
        items {
          id
          name
          projectID
          createdAt
          updatedAt
        }
        nextToken
      }
      createdAt
      updatedAt
    }
  }
`;
export const onCreateProjectConcept = /* GraphQL */ `
  subscription OnCreateProjectConcept {
    onCreateProjectConcept {
      id
      name
      projectID
      createdAt
      updatedAt
    }
  }
`;
export const onUpdateProjectConcept = /* GraphQL */ `
  subscription OnUpdateProjectConcept {
    onUpdateProjectConcept {
      id
      name
      projectID
      createdAt
      updatedAt
    }
  }
`;
export const onDeleteProjectConcept = /* GraphQL */ `
  subscription OnDeleteProjectConcept {
    onDeleteProjectConcept {
      id
      name
      projectID
      createdAt
      updatedAt
    }
  }
`;
