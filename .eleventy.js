const { feedPlugin } = require("@11ty/eleventy-plugin-rss");



module.exports = function(eleventyConfig) {
    eleventyConfig.addPlugin(feedPlugin, {
        type: "atom",
        outputPath: "/rss.xml",
        collection: {
            name: "posts",
            limit: 0,

        },
        metadata: {
            title: "Griphcode | Blog",
            base: "https://blog.griphcode.dev",
            subtitle: "My person blog :)",
            author: {
                name: "griphcode",
            }
        }
    });
    eleventyConfig.addPassthroughCopy("assets");
}