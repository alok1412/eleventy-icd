// required packages
const fetch = require("node-fetch");

// // do we make a query ?
// let makeNewQuery = true;

const API_URL = 'https://digital.icdindia.com/graphql'
async function fetchAPI(query, { variables } = {}) {
    // Set up some headers to tell the fetch call
    // that this is an application/json type
    const headers = { 'Content-Type': 'application/json' , 'User-Agent': '*' , 'Authorization' : 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwczpcL1wvZGlnaXRhbC5pY2RpbmRpYS5jb20iLCJpYXQiOjE2MzUyNDg2MDgsIm5iZiI6MTYzNTI0ODYwOCwiZXhwIjozMzE3MTI0ODYwOCwiZGF0YSI6eyJ1c2VyIjp7ImlkIjoiMSJ9fX0.-Bqv76lgWORwFfc11ft6iY7umCbDndL42N9grpDtmEc'};
  
    let posts = []
    let categoriesData = []
    let meta = []
  
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
                    fragment SeoFragment on PostTypeSEO {
                        title
                        opengraphDescription
                        opengraphImage {
                        sourceUrl
                        }
                        opengraphSiteName
                    }
                    
                    query AllPosts {
                        posts(first: 20, where: {orderby: {field: DATE, order: DESC}}) {
                        nodes {
                            title
                            seo {
                            ...SeoFragment
                            }
                            excerpt
                            slug
                            date
                            content
                            featuredImage {
                            node {
                                sourceUrl
                            }
                            }
                            likes {
                            likes
                            }
                            leadComponentPost {
                            leadComponent {
                                sourceUrl
                            }
                            }
                            postAuthor {
                            author {
                            ... on Team {
                            title
                            profileImage {
                                profileImage {
                                sourceUrl
                                }
                            }
                            }
                            }
                            }
                            categories {
                            edges {
                                node {
                                name
                                }
                            }
                            }
                            tags {
                            edges {
                                node {
                                name
                                }
                            }
                            }
                            author {
                            node {
                                name
                                firstName
                                lastName
                                avatar {
                                url
                                }
                            }
                            }
                        }
                        }
                    }
                        
                `,
        variables,
      }),
    });

    const category = await fetch(API_URL, {
        method: 'POST',
        headers,
        body: JSON.stringify({
            query: 
            `
            {
                categories(where: {orderby: TERM_ID}){
                  nodes {
                    id
                    name
                    slug
                  }
                }
              }
            `
        })
    });

    const data = await category.json();
    if ( data.errors ) {
        let errors = data.errors;
        errors.map((error) => {
            console.log(error.message);
        });
        throw new Error("Aborting due to error from GraphQL query");
    }

    categoriesData = categoriesData.concat(data.data.categories.nodes);

    const pageData = await fetch(API_URL, {
        method: 'POST',
        headers,
        body: JSON.stringify({
            query: 
            `
            {
              pages(where: {title: "posts"}) {
                  nodes {
                    title
                    featuredImage {
                      node {
                        sourceUrl
                      }
                    }
                    seo {
                      ...SeoFragment
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
            `
        })
    });

    const page = await pageData.json();
    if ( page.errors ) {
        let errors = page.errors;
        errors.map((error) => {
            console.log(error.message);
        });
        throw new Error("Aborting due to error from GraphQL query");
    }

    meta = meta.concat(page.data.pages.nodes);
  
    const response = await res.json();
    if ( response.errors ) {
        let errors = response.errors;
        errors.map((error) => {
            console.log(error.message);
        });
        throw new Error("Aborting due to error from GraphQL query");
    }

    posts = posts.concat(response.data.posts.nodes);

    } catch ( error ) {
        throw new Error(error);
    }

    const postsFormatted = posts.map((item) => {
        var checkauthor = item?.postAuthor?.author
        if(checkauthor){
            var author = item?.postAuthor?.author[0]?.title
            var authorImg = item?.postAuthor?.author[0]?.profileImage?.profileImage.sourceUrl
          }
        var categories = item?.categories.edges[0]?.node?.name
        var date = item?.date

        return {
            title: item?.title,
            slug: item.slug,
            data: item,
            featuredImage : item.leadComponentPost?.leadComponent?.sourceUrl,
            content: item.content,
            like : item?.likes.likes,
            author,
            authorImg,
            categories,
            date,
            categoriesData,
            meta : meta[0]
        };
    });

    return postsFormatted;

}


  


module.exports = fetchAPI;

