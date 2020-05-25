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
      logo {
        key
        identityId
      }
      concepts {
        items {
          id
          name
          projectID
          moodboard {
            key
            identityId
          }
          pages {
            items {
              id
              name
              size
              conceptID
              image {
                key
                identityId
              }
              createdAt
              updatedAt
            }
            nextToken
          }
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
      logo {
        key
        identityId
      }
      concepts {
        items {
          id
          name
          projectID
          moodboard {
            key
            identityId
          }
          pages {
            items {
              id
              name
              size
              conceptID
              image {
                key
                identityId
              }
              createdAt
              updatedAt
            }
            nextToken
          }
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
      logo {
        key
        identityId
      }
      concepts {
        items {
          id
          name
          projectID
          moodboard {
            key
            identityId
          }
          pages {
            items {
              id
              name
              size
              conceptID
              image {
                key
                identityId
              }
              createdAt
              updatedAt
            }
            nextToken
          }
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
export const onCreateConcept = /* GraphQL */ `
  subscription OnCreateConcept {
    onCreateConcept {
      id
      name
      projectID
      moodboard {
        key
        identityId
      }
      pages {
        items {
          id
          name
          size
          conceptID
          image {
            key
            identityId
          }
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
export const onUpdateConcept = /* GraphQL */ `
  subscription OnUpdateConcept {
    onUpdateConcept {
      id
      name
      projectID
      moodboard {
        key
        identityId
      }
      pages {
        items {
          id
          name
          size
          conceptID
          image {
            key
            identityId
          }
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
export const onDeleteConcept = /* GraphQL */ `
  subscription OnDeleteConcept {
    onDeleteConcept {
      id
      name
      projectID
      moodboard {
        key
        identityId
      }
      pages {
        items {
          id
          name
          size
          conceptID
          image {
            key
            identityId
          }
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
export const onCreatePage = /* GraphQL */ `
  subscription OnCreatePage {
    onCreatePage {
      id
      name
      size
      conceptID
      image {
        key
        identityId
      }
      createdAt
      updatedAt
    }
  }
`;
export const onUpdatePage = /* GraphQL */ `
  subscription OnUpdatePage {
    onUpdatePage {
      id
      name
      size
      conceptID
      image {
        key
        identityId
      }
      createdAt
      updatedAt
    }
  }
`;
export const onDeletePage = /* GraphQL */ `
  subscription OnDeletePage {
    onDeletePage {
      id
      name
      size
      conceptID
      image {
        key
        identityId
      }
      createdAt
      updatedAt
    }
  }
`;
