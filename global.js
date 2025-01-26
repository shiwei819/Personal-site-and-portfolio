console.log('IT’S ALIVE!');

function $$(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
}

// label current link as class 'current'
let navLinks = $$("nav a");
let currentLink = navLinks.find(
    (a) => a.host === location.host && a.pathname === location.pathname
);

if (currentLink) {
    // or if (currentLink !== undefined)
    currentLink.classList.add('current');
}
// or using the following just for prevent error
// currentLink?.classList.add('current');

