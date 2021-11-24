// required packages
const fetch = require("node-fetch");

// // do we make a query ?
// let makeNewQuery = true;

const API_URL = 'https://digital.icdindia.com/graphql'
async function fetchAPI(query, { variables } = {}) {
    // Set up some headers to tell the fetch call
    // that this is an application/json type
    const headers = { 'Content-Type': 'application/json' , 'User-Agent': '*' , 'Authorization' : 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwczpcL1wvZGlnaXRhbC5pY2RpbmRpYS5jb20iLCJpYXQiOjE2MzUyNDg2MDgsIm5iZiI6MTYzNTI0ODYwOCwiZXhwIjozMzE3MTI0ODYwOCwiZGF0YSI6eyJ1c2VyIjp7ImlkIjoiMSJ9fX0.-Bqv76lgWORwFfc11ft6iY7umCbDndL42N9grpDtmEc'};
  
    let pages = []
  
    // if (process.env.WORDPRESS_AUTH_REFRESH_TOKEN) {
    //   headers[
    //     'Authorization'
    //   ] = `Bearer ${process.env.WORDPRESS_AUTH_REFRESH_TOKEN}`
    // }
  
    // build out the fetch() call using the API_URL
    // environment variable pulled in at the start
    // Note the merging of the query and variables
    try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        query : `
        {
            pages(where: {title: "home"}) {
              nodes {
                featuredImage {
                  node {
                    sourceUrl
                  }
                }
                content
                seo {
                  ...SeoFragment
                }
                featuredtext {
                  content
                }
                homePage {
                  featuredCards {
                    ... on Card {
                      featuredImage {
                        node {
                          sourceUrl
                        }
                      }
                      content
                      cardCategories {
                        edges {
                          node {
                            name
                          }
                        }
                      }
                      designOptions {
                        darkBg
                        yellowBg
                      }
                    }
                  }
                }
                projects {
                  highlightedProjects {
                    ... on Project {
                      id
                      title
                      slug
                      clients {
                        edges {
                          node {
                            name
                          }
                        }
                      }
                      highlightedImage {
                        highlightedThumbnail {
                          sourceUrl
                        }
                        highlightedThumbnailMobile {
                          sourceUrl
                        }
                        video {
                          mediaItemUrl
                        }
                        videoForMobile {
                          sourceUrl
                        }
                      }
                    }
                  }
                }
              }
            }
          }
          
          fragment SeoFragment on PostTypeSEO {
            title
            metaDesc
            metaRobotsNoindex
            metaRobotsNofollow
          }          
                `,
        variables,
      }),
    });
  
    const response = await res.json();
    if ( response.errors ) {
        let errors = response.errors;
        errors.map((error) => {
            console.log(error.message);
        });
        throw new Error("Aborting due to error from GraphQL query");
    }

    pages = pages.concat(response.data.pages.nodes);

    } catch ( error ) {
        throw new Error(error);
    }

    const pagesFormatted = pages.map((item) => {
        return {
            title: item?.seo?.title,
            slug: item.slug,
            body: item.content,
            data: item,
            project: item.projects,
            content : item.featuredtext,
            featuredCards : item.homePage
        };
    });

    return pagesFormatted;
}


  


module.exports = fetchAPI;

