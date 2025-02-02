// fetching project data and rendering the latest projects on the home page
import { fetchJSON, renderProjects, fetchGitHubData } from './global.js';

const projects = await fetchJSON('./lib/projects.json');
const latestProjects = projects.slice(0,3);

const projectsContainer = document.querySelector('.projects');

renderProjects(latestProjects, projectsContainer, 'h2');

// Attaching GitHub Data
// githubData in JSON
const githubData = await fetchGitHubData('shiwei819');
const profileStats = document.querySelector('#profile-stats');

if (profileStats) {

    profileStats.innerHTML = `
        <dl>
            <dt>Since</dt><dd>${githubData.created_at.slice(0,githubData.created_at.indexOf('T'))}</dd>
            <dt>Public Repos</dt><dd>${githubData.public_repos}</dd>
            <dt>Public Gists</dt><dd>${githubData.public_gists}</dd>
            <dt>Followers</dt><dd>${githubData.followers}</dd>
            <dt>Following</dt><dd>${githubData.following}</dd>
        </dl>
    `;
    
}