const Image = require("@11ty/eleventy-img");
const eleventyNavigationPlugin = require("@11ty/eleventy-navigation");

module.exports = function (eleventyConfig) {

  eleventyConfig.addPassthroughCopy("./src/static");
  eleventyConfig.addPassthroughCopy("./src/admin");
  eleventyConfig.addPassthroughCopy("./src/_data");

  // works also with addLiquidShortcode or addJavaScriptFunction
  eleventyConfig.addShortcode("responsiveimage", async function(src, alt, src_width, src_height, sizes = "100vw", ) {
    if(alt === undefined) {
      // You bet we throw an error on missing alt (alt="" works okay)
      throw new Error(`Missing \`alt\` on responsiveimage from: ${src}`);
    }

    let metadata = await Image(src, {
      widths: [src_width, src_height],
      formats: ['webp'],
      urlPath: "/static/img-tmp",
      outputDir: "./dist/static/img-tmp"
    });

    let lowsrc = metadata.webp[0], img_width, img_height;
    lowsrc.url = lowsrc.url;

    if(src_width && src_height){
      img_width = src_width;
      img_height = src_height;
    } else {
      img_width = lowsrc.width;
      img_height = lowsrc.height;
    }

    return `<picture>
      ${Object.values(metadata).map(imageFormat => {
        return `  <source type="image/${imageFormat[0].format}" srcset="${imageFormat.map(entry => entry.srcset).join(", ")}" sizes="${sizes}">`;
      }).join("\n")}
        <img
          src="${lowsrc.url}"
          width="${img_width}"
          height="${img_height}"
          alt="${alt}"
          loading="lazy"
          decoding="async">
      </picture>`;
  });

  // breadcrumbs for navigation
  eleventyConfig.addPlugin(eleventyNavigationPlugin);
  



  return {
    dir: {
      input: "src",
      output: "dist"
    },
    htmlTemplateEngine: "njk",
  };
};
