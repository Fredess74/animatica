export default [
    {
        ignores: ["dist/**", "node_modules/**"]
    },
    {
        files: ["**/*.ts", "**/*.tsx"],
        rules: {
            // Minimal rules to pass CI for now
        }
    }
];
