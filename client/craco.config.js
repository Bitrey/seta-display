module.exports = {
    plugins: [{ plugin: require("@semantic-ui-react/craco-less") }],
    style: {
        postcss: {
            plugins: [require("tailwindcss"), require("autoprefixer")]
        }
    },
    babel: {
        plugins:
            process.env.NODE_ENV === "production"
                ? [["transform-remove-console", { exclude: ["error"] }]]
                : []
    }
};
