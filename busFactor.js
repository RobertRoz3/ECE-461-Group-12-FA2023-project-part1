"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBusFactor = exports.fetchContributors = void 0;
const node_fetch_1 = __importDefault(require("node-fetch"));
const dotenv_1 = __importDefault(require("dotenv"));
const logger_1 = __importDefault(require("./logger"));
//Initialize logger
const logger = (0, logger_1.default)('Bus Factor');
dotenv_1.default.config();
async function fetchContributors(fullRepoUrl) {
    logger.info(`Fetching contributors for repo: ${fullRepoUrl}`);
    const repoUrlMatch = fullRepoUrl.match(/github\.com\/([\w-]+\/[\w-]+)/);
    if (!repoUrlMatch || repoUrlMatch.length < 2 || repoUrlMatch === null) {
        logger.info(`Invalid GitHub repository URL: ${fullRepoUrl}`);
        console.log(`Invalid GitHub repository URL: ${fullRepoUrl}`);
        process.exit(1);
    }
    const repoUrl = repoUrlMatch[1];
    const apiUrl = `https://api.github.com/repos/${repoUrlMatch[1]}/contributors`;
    logger.info(`Constructed API URL: ${apiUrl}`);
    const response = await (0, node_fetch_1.default)(apiUrl, {
        headers: {
            Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
            Accept: 'application/vnd.github.v3+json',
        },
    });
    if (!response.ok) {
        logger.info(`Failed to fetch contributors from ${repoUrl}. Status: ${response.statusText}`);
        console.log(`Failed to fetch contributors from ${repoUrl}. Status: ${response.statusText}`);
        process.exit(1);
    }
    let data;
    try {
        data = await response.json();
    }
    catch (err) {
        logger.info(`Failed to parse response from ${repoUrl}. Status: ${response.statusText}`);
        console.log(`Failed to parse response from ${repoUrl}. Status: ${response.statusText}`);
        process.exit(1);
    }
    if (!Array.isArray(data) || !data.every((d) => 'login' in d && 'contributions' in d)) {
        logger.info(`Expected an array of contributors but received a different type.`);
        console.log(`Expected an array of contributors but received a different type.`);
        process.exit(1);
    }
    return data.map((item) => ({
        login: item.login,
        contributions: item.contributions,
    }));
}
exports.fetchContributors = fetchContributors;
function calculateBusFactor(contributors) {
    if (contributors.length === 1 && contributors[0].contributions > 0) {
        logger.info(`Only one contributor with all contributions. Bus factor: 0`);
        return 0;
    }
    const sortedContributors = [...contributors].sort((a, b) => b.contributions - a.contributions);
    let majorContributorsCount = 0;
    let contributionsCounted = 0;
    const percentOfTotalContributions = sortedContributors.reduce((acc, contributor) => acc + contributor.contributions, 0) * 0.6;
    for (const contributor of sortedContributors) {
        contributionsCounted += contributor.contributions;
        majorContributorsCount++;
        if (contributionsCounted >= percentOfTotalContributions) {
            logger.info(`Bus factor calculated with ${majorContributorsCount} major contributors.`);
            break;
        }
    }
    const busFactor = Math.min(majorContributorsCount / 10, 1);
    logger.info(`Calculated bus factor: ${busFactor}`);
    return busFactor;
}
async function getBusFactor(repoUrl) {
    const contributors = await fetchContributors(repoUrl);
    return calculateBusFactor(contributors);
}
exports.getBusFactor = getBusFactor;
