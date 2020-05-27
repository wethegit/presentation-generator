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
      logo {
        key
        identityId
      }
      concepts {
        items {
          id
          name
          moodboard {
            key
            identityId
          }
          pages {
            items {
              id
              name
              variants {
                items {
                  id
                  size
                  image {
                    key
                    identityId
                  }
                  pageID
                  createdAt
                  updatedAt
                }
                nextToken
              }
              conceptID
              createdAt
              updatedAt
            }
            nextToken
          }
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
      logo {
        key
        identityId
      }
      concepts {
        items {
          id
          name
          moodboard {
            key
            identityId
          }
          pages {
            items {
              id
              name
              variants {
                items {
                  id
                  size
                  image {
                    key
                    identityId
                  }
                  pageID
                  createdAt
                  updatedAt
                }
                nextToken
              }
              conceptID
              createdAt
              updatedAt
            }
            nextToken
          }
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
      logo {
        key
        identityId
      }
      concepts {
        items {
          id
          name
          moodboard {
            key
            identityId
          }
          pages {
            items {
              id
              name
              variants {
                items {
                  id
                  size
                  image {
                    key
                    identityId
                  }
                  pageID
                  createdAt
                  updatedAt
                }
                nextToken
              }
              conceptID
              createdAt
              updatedAt
            }
            nextToken
          }
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
export const createConcept = /* GraphQL */ `
  mutation CreateConcept(
    $input: CreateConceptInput!
    $condition: ModelConceptConditionInput
  ) {
    createConcept(input: $input, condition: $condition) {
      id
      name
      moodboard {
        key
        identityId
      }
      pages {
        items {
          id
          name
          variants {
            items {
              id
              size
              image {
                key
                identityId
              }
              pageID
              createdAt
              updatedAt
            }
            nextToken
          }
          conceptID
          createdAt
          updatedAt
        }
        nextToken
      }
      projectID
      createdAt
      updatedAt
    }
  }
`;
export const updateConcept = /* GraphQL */ `
  mutation UpdateConcept(
    $input: UpdateConceptInput!
    $condition: ModelConceptConditionInput
  ) {
    updateConcept(input: $input, condition: $condition) {
      id
      name
      moodboard {
        key
        identityId
      }
      pages {
        items {
          id
          name
          variants {
            items {
              id
              size
              image {
                key
                identityId
              }
              pageID
              createdAt
              updatedAt
            }
            nextToken
          }
          conceptID
          createdAt
          updatedAt
        }
        nextToken
      }
      projectID
      createdAt
      updatedAt
    }
  }
`;
export const deleteConcept = /* GraphQL */ `
  mutation DeleteConcept(
    $input: DeleteConceptInput!
    $condition: ModelConceptConditionInput
  ) {
    deleteConcept(input: $input, condition: $condition) {
      id
      name
      moodboard {
        key
        identityId
      }
      pages {
        items {
          id
          name
          variants {
            items {
              id
              size
              image {
                key
                identityId
              }
              pageID
              createdAt
              updatedAt
            }
            nextToken
          }
          conceptID
          createdAt
          updatedAt
        }
        nextToken
      }
      projectID
      createdAt
      updatedAt
    }
  }
`;
export const createPage = /* GraphQL */ `
  mutation CreatePage(
    $input: CreatePageInput!
    $condition: ModelPageConditionInput
  ) {
    createPage(input: $input, condition: $condition) {
      id
      name
      variants {
        items {
          id
          size
          image {
            key
            identityId
          }
          pageID
          createdAt
          updatedAt
        }
        nextToken
      }
      conceptID
      createdAt
      updatedAt
    }
  }
`;
export const updatePage = /* GraphQL */ `
  mutation UpdatePage(
    $input: UpdatePageInput!
    $condition: ModelPageConditionInput
  ) {
    updatePage(input: $input, condition: $condition) {
      id
      name
      variants {
        items {
          id
          size
          image {
            key
            identityId
          }
          pageID
          createdAt
          updatedAt
        }
        nextToken
      }
      conceptID
      createdAt
      updatedAt
    }
  }
`;
export const deletePage = /* GraphQL */ `
  mutation DeletePage(
    $input: DeletePageInput!
    $condition: ModelPageConditionInput
  ) {
    deletePage(input: $input, condition: $condition) {
      id
      name
      variants {
        items {
          id
          size
          image {
            key
            identityId
          }
          pageID
          createdAt
          updatedAt
        }
        nextToken
      }
      conceptID
      createdAt
      updatedAt
    }
  }
`;
export const createPageVariant = /* GraphQL */ `
  mutation CreatePageVariant(
    $input: CreatePageVariantInput!
    $condition: ModelPageVariantConditionInput
  ) {
    createPageVariant(input: $input, condition: $condition) {
      id
      size
      image {
        key
        identityId
      }
      pageID
      createdAt
      updatedAt
    }
  }
`;
export const updatePageVariant = /* GraphQL */ `
  mutation UpdatePageVariant(
    $input: UpdatePageVariantInput!
    $condition: ModelPageVariantConditionInput
  ) {
    updatePageVariant(input: $input, condition: $condition) {
      id
      size
      image {
        key
        identityId
      }
      pageID
      createdAt
      updatedAt
    }
  }
`;
export const deletePageVariant = /* GraphQL */ `
  mutation DeletePageVariant(
    $input: DeletePageVariantInput!
    $condition: ModelPageVariantConditionInput
  ) {
    deletePageVariant(input: $input, condition: $condition) {
      id
      size
      image {
        key
        identityId
      }
      pageID
      createdAt
      updatedAt
    }
  }
`;
