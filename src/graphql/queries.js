/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getProject = /* GraphQL */ `
  query GetProject($id: ID!) {
    getProject(id: $id) {
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
export const listProjects = /* GraphQL */ `
  query ListProjects(
    $filter: ModelProjectFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listProjects(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
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
      nextToken
    }
  }
`;
export const projectsByClient = /* GraphQL */ `
  query ProjectsByClient(
    $client: ClientGroupEnum
    $sortDirection: ModelSortDirection
    $filter: ModelProjectFilterInput
    $limit: Int
    $nextToken: String
  ) {
    projectsByClient(
      client: $client
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
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
      nextToken
    }
  }
`;
export const projectsBySlug = /* GraphQL */ `
  query ProjectsBySlug(
    $slug: String
    $sortDirection: ModelSortDirection
    $filter: ModelProjectFilterInput
    $limit: Int
    $nextToken: String
  ) {
    projectsBySlug(
      slug: $slug
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
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
      nextToken
    }
  }
`;
export const pageVariantBySize = /* GraphQL */ `
  query PageVariantBySize(
    $size: PageSizeEnum
    $sortDirection: ModelSortDirection
    $filter: ModelPageVariantFilterInput
    $limit: Int
    $nextToken: String
  ) {
    pageVariantBySize(
      size: $size
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
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
  }
`;
