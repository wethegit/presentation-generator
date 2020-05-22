/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const createProject = /* GraphQL */ `
  mutation CreateProject(
    $input: CreateProjectInput!
    $condition: ModelProjectConditionInput
  ) {
    createProject(input: $input, condition: $condition) {
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
export const updateProject = /* GraphQL */ `
  mutation UpdateProject(
    $input: UpdateProjectInput!
    $condition: ModelProjectConditionInput
  ) {
    updateProject(input: $input, condition: $condition) {
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
export const deleteProject = /* GraphQL */ `
  mutation DeleteProject(
    $input: DeleteProjectInput!
    $condition: ModelProjectConditionInput
  ) {
    deleteProject(input: $input, condition: $condition) {
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
export const createProjectConcept = /* GraphQL */ `
  mutation CreateProjectConcept(
    $input: CreateProjectConceptInput!
    $condition: ModelProjectConceptConditionInput
  ) {
    createProjectConcept(input: $input, condition: $condition) {
      id
      name
      projectID
      createdAt
      updatedAt
    }
  }
`;
export const updateProjectConcept = /* GraphQL */ `
  mutation UpdateProjectConcept(
    $input: UpdateProjectConceptInput!
    $condition: ModelProjectConceptConditionInput
  ) {
    updateProjectConcept(input: $input, condition: $condition) {
      id
      name
      projectID
      createdAt
      updatedAt
    }
  }
`;
export const deleteProjectConcept = /* GraphQL */ `
  mutation DeleteProjectConcept(
    $input: DeleteProjectConceptInput!
    $condition: ModelProjectConceptConditionInput
  ) {
    deleteProjectConcept(input: $input, condition: $condition) {
      id
      name
      projectID
      createdAt
      updatedAt
    }
  }
`;
