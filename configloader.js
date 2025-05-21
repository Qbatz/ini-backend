// configloader.js
const fs = require('fs');
const yaml = require('js-yaml');

function loadYamlEnv(filePath = './app.yml') {
    try {
        const fileContents = fs.readFileSync(filePath, 'utf8');
        const yamlData = yaml.load(fileContents);

        if (yamlData.env) {
            for (const key in yamlData.env) {
                const envKey = key.toUpperCase();
                process.env[envKey] = yamlData.env[key];
            }
        }

    } catch (error) {
        console.error("Failed to load YAML config:", error);
    }
}

module.exports = loadYamlEnv;
