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
export const onCreateConcept = /* GraphQL */ `
  subscription OnCreateConcept {
    onCreateConcept {
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
export const onUpdateConcept = /* GraphQL */ `
  subscription OnUpdateConcept {
    onUpdateConcept {
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
export const onDeleteConcept = /* GraphQL */ `
  subscription OnDeleteConcept {
    onDeleteConcept {
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
export const onCreatePage = /* GraphQL */ `
  subscription OnCreatePage {
    onCreatePage {
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
export const onUpdatePage = /* GraphQL */ `
  subscription OnUpdatePage {
    onUpdatePage {
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
export const onDeletePage = /* GraphQL */ `
  subscription OnDeletePage {
    onDeletePage {
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
export const onCreatePageVariant = /* GraphQL */ `
  subscription OnCreatePageVariant {
    onCreatePageVariant {
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
export const onUpdatePageVariant = /* GraphQL */ `
  subscription OnUpdatePageVariant {
    onUpdatePageVariant {
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
export const onDeletePageVariant = /* GraphQL */ `
  subscription OnDeletePageVariant {
    onDeletePageVariant {
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
