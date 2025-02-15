console.log('IT’S ALIVE!');

function $$(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
}

// // label current link as class 'current' [when we already have navigation bar]
// let navLinks = $$("nav a");
// let currentLink = navLinks.find(
//     (a) => a.host === location.host && a.pathname === location.pathname
// );

// if (currentLink) {
//     // or if (currentLink !== undefined)
//     currentLink.classList.add('current');
// }
// // or using the following just for prevent error
// // currentLink?.classList.add('current');

// Create automatical navigation bar
const ARE_WE_HOME = document.documentElement.classList.contains('home');


let pages = [
    { url: '', title: 'Home'},
    { url: 'projects/', title: 'Projects'},
    { url: 'contact/', title: 'Contact'},
    { url: 'https://github.com/shiwei819', title: 'Profile'},
    { url: 'meta/', title: 'Meta'},
    { url: 'resume/', title: 'Resume'},
];

let nav = document.createElement('nav');
document.body.prepend(nav);

for (let page of pages) {
    let url = page.url;
    let title = page.title;

    if (!ARE_WE_HOME && !url.startsWith('http')){   // why don't we use location. !== ARE_WE_HOME
        url = '../' + url;
    }

    // nav.prepend(document.createElement('a','href'=url)) X wrong syntax
    // nav.insertAdjacentHTML('beforeend',`<a href="${url}">${title}</a>`); // V but less flexibility

    let a = document.createElement('a');
    a.href = url;
    a.textContent = title;
    // a.host === location.host && a.pathname === location.pathname ? a.classList.add('current'):a;  A brief way
    a.classList.toggle(
        'current',
        a.host === location.host && a.pathname === location.pathname
    );

    if (a.host !== location.host){
        a.target='_blank';
    }

    nav.append(a);

}

// automatical color-scheme dropdown
let scheme_prefered = window.matchMedia("(prefers-color-scheme: light)").matches? 'light' : 'dark';

document.body.insertAdjacentHTML(
    'afterbegin',
    `
      <label class="color-scheme">
          Theme:
          <select>
              <option value='light dark'>Automatic(${scheme_prefered})</option>
              <option value='light'>Light</option>
              <option value='dark'>Dark</option>
          </select>
      </label>
    `
  );

let select = document.querySelector('label select');
select.addEventListener('input',function(event){
  console.log('color scheme changed to', event.target.value);
  document.documentElement.style.setProperty('color-scheme',event.target.value);
  localStorage.colorScheme = event.target.value;
});

if ('colorScheme' in localStorage){
  document.documentElement.style.setProperty('color-scheme',localStorage.colorScheme);
  select.value = localStorage.colorScheme;
}


// Contact me Improvement
let form = $$('form')[0];
form?.addEventListener('submit',function(event){
  event.preventDefault();
  let url = form.action + "?";
  let data = new FormData(form);
  for (let [name, value] of data){
      url = url + name + "=" + encodeURIComponent(value) + "&";
      // console.log(url);
  }

  location.href = url;
});

// Projects automatically update
export async function fetchJSON(url) {
  try {
    // Fetch the JSON file from the given URL
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch projects: ${response.statusText}`);
    }

    const data = await response.json();
    return data;

  } catch (error) {
      console.error('Error fetching or parsing JSON data:', error);
      
  }
}

// project object should contain JSON file, containerElement might be article element
export function renderProjects(projects, containerElement, headingLevel = 'h2'){
  // reset to avoid duplicates in container
  containerElement.innerHTML = '';
  const width = 277;
  const height = 138;

  for (let project of projects) {

    //create element to modify inside element in details
    const article = document.createElement('article');

    article.innerHTML = `
      <h3>${project.title}</h3>
      <img src="${project.image}" alt="${project.title}" width=${width} height=${height}>
      <div><p>${project.description}</p>
      <p class="year">${project.year}<p>
      </div>
    `;

    containerElement.appendChild(article);
  }
  
}

export async function fetchGitHubData(username) {
  return fetchJSON(`https://api.github.com/users/${username}`);
}
