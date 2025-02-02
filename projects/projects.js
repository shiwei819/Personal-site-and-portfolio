import { fetchJSON, renderProjects } from '../global.js'

let projects = await fetchJSON('../lib/projects.json');
const projectsContainer = document.querySelector('.projects');

renderProjects(projects, projectsContainer, 'h2');

// Counting projects
const projectsTitle = document.querySelector('.project-title');
projectsTitle.textContent = projects.length + ' Projects';