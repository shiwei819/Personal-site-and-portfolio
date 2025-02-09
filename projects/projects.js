import { fetchJSON, renderProjects } from '../global.js'
import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm";

let projects = await fetchJSON('../lib/projects.json');
const projectsContainer = document.querySelector('.projects');
let filteredProject = projects; // for input filtering, updated by year select  EXTRA CREDIT
let selectedProject = projects; // for select filtering, updated by input       EXTRA CREDIT

renderProjects(projects, projectsContainer, 'h2');

// Counting projects
const projectsTitle = document.querySelector('.project-title');
projectsTitle.textContent = projects.length + ' Projects';

// draw pie-plot

//      v--- function
let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);
// ===============================================================
// // draw one circle
// //   v-- <path/> containig the shape
// let arc = arcGenerator({
//     startAngle: 0,
//     endAngle: 2 * Math.PI,
// });

// // put the <path/> of the shape to where we want
// d3.select('svg').append('path').attr('d', arc).attr('fill','red');
// ===============================================================
// separately draw two slices of circle
// let data = [1, 2];
// let total = 0;

// for (let d of data){
//     total += d;
// }

// let angle = 0;
// let arcData = [];

// for (let d of data) {
//     let endAngle = angle + (d/total) * 2 * Math.PI;
//     arcData.push({startAngle: angle, endAngle});
//     angle = endAngle;
// }

// let arcs = arcData.map((d) => arcGenerator(d));
// let colors = ['gold','purple'];

// arcs.forEach((arc, idx) =>{
//     d3.select('svg')
//       .append('path')
//       .attr('d', arc)
//       .attr('fill',colors[idx]);
// });
// ===============================================================

// render new pie chart
function renderPieChart(projectsGive){
    let newRolledData = d3.rollups(
        projectsGive,
        (v) => v.length,
        (d) => d.year,
    );
    
    let newData = newRolledData.map(([year,count]) => {
        return { value: count, label: year};
    });

    let newSliceGenerator = d3.pie().value((d) => d.value);
    let newArcData = newSliceGenerator(newData);
    let newArcs = newArcData.map((d) => arcGenerator(d));
    // clear path and legend
    // document.querySelector('#projects-pie-plot').target.value = '';  X
    // document.querySelector('.legend').target.value = '';             X
    d3.select('svg').selectAll('path').remove();
    d3.select('ul').selectAll('li').remove();

    newArcs.forEach((newArc, newIdx) =>{
        d3.select('svg')
        .append('path')
        .attr('d', newArc)
        .attr('fill',colors(newIdx))
        .on('click', () => {
            selectedIndex = selectedIndex === newIdx ? -1 : newIdx;

            // highlight selected wedge
            svg.selectAll('path')
            .attr('class', (_, idx) => (
                // filter idx to find correct pie slice and apply CSS from above
                selectedIndex === idx ? 'selected': null
            ));

            // highlight selected legend
            legend.selectAll('li')
                .attr('class', (_,idx) => (
                    // filter idx to find correct legend and apply CSS from above
                    selectedIndex === idx ? 'selected' : 'swatch-point'
                ));

            // update filtered project by selected year
            if (selectedIndex === -1) {
                renderProjects(selectedProject, projectsContainer, 'h2');
                filteredProject = projects;
            } else {
                data.forEach((d,idx) => {
                    if (selectedIndex === idx){
                        filteredProject = selectedProject.filter((project) => project.year.includes(d.label));

                        renderProjects(filteredProject, projectsContainer, 'h2');
                    }
                });
                
            }
        })
    });

    // add legend to pie plot
    let legend = d3.select('.legend');
    newData.forEach((d,idx) => {
        legend.append('li')
            .attr('style', `--color:${colors(idx)}`) // set the style attribute while passing in parameters
            .attr('class', 'swatch-point')
            .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`);    // set the inner html of <li>
    })
}

// get my project data
let rolledData = d3.rollups(
    projects,
    (v) => v.length,
    (d) => d.year,
);

let data = rolledData.map(([year,count]) => {
    return { value: count, label: year};
});

let sliceGenerator = d3.pie().value((d) => d.value);
let arcData = sliceGenerator(data);
let arcs = arcData.map((d) => arcGenerator(d));
let colors = d3.scaleOrdinal(d3.schemeTableau10);
//   ^--- it's a function 

arcs.forEach((arc, idx) =>{
    d3.select('svg')
      .append('path')
      .attr('d', arc)
      .attr('fill',colors(idx));
});

// add legend to pie plot
let legend = d3.select('.legend');
data.forEach((d,idx) => {
    legend.append('li')
          .attr('style', `--color:${colors(idx)}`) // set the style attribute while passing in parameters
          .attr('class', 'swatch-point')
          .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`);    // set the inner html of <li>
})

// search field for filtering data
let query = '';

let searchInput = document.querySelector('.searchBar');

searchInput.addEventListener('input', (event) => {
    // update query value
    query = event.target.value;

    // reset filterProjects 
    if (query === ''){
        selectedProject = projects;
        // render updated projects
        renderProjects(filteredProject, projectsContainer, 'h2');

        renderPieChart(projects);

        // update back to where initially year is filtered
        svg = d3.select('svg');

        svg.selectAll('path').remove();
        arcs.forEach((arc, i) => {
                svg.append('path')
                   .attr('d', arc)
                   .attr('fill', colors(i))
                   .on('click', () => {
                    selectedIndex = selectedIndex === i ? -1 : i;
        
                    // highlight selected wedge
                    svg.selectAll('path')
                       .attr('class', (_, idx) => (
                        // filter idx to find correct pie slice and apply CSS from above
                        selectedIndex === idx ? 'selected': null
                       ));
        
                    // highlight selected legend
                    legend.selectAll('li')
                        .attr('class', (_,idx) => (
                            // filter idx to find correct legend and apply CSS from above
                            selectedIndex === idx ? 'selected' : 'swatch-point'
                        ));
        
                    // update filtered project by selected year
                    if (selectedIndex === -1) {
                        renderProjects(projects, projectsContainer, 'h2');
                        filteredProject = projects;
                    } else {
                        data.forEach((d,idx) => {
                            if (selectedIndex === idx){
                                filteredProject = selectedProject.filter((project) => project.year.includes(d.label));
        
                                renderProjects(filteredProject, projectsContainer, 'h2');
                            }
                        });
                        
                    }
                });

                // highlight selected wedge
                svg.selectAll('path')
                .attr('class', (_, idx) => (
                    // filter idx to find correct pie slice and apply CSS from above
                    selectedIndex === idx ? 'selected': null
                ));

                // highlight selected legend
                legend.selectAll('li')
                    .attr('class', (_,idx) => (
                        // filter idx to find correct legend and apply CSS from above
                        selectedIndex === idx ? 'selected' : 'swatch-point'
                    ));

                // update filtered project by selected year
                if (selectedIndex === -1) {
                    renderProjects(projects, projectsContainer, 'h2');
                    filteredProject = projects;
                } else {
                    data.forEach((d,idx) => {
                        if (selectedIndex === idx){
                            filteredProject = selectedProject.filter((project) => project.year.includes(d.label));

                            renderProjects(filteredProject, projectsContainer, 'h2');
                        }
                    });
                    
                }

        });

    } else {
        // filter the projects
        // let filteredProject = projects.filter((projects) => projects.title.includes(query)); // case sensitive
        // vvvvvvvvvvvvvvvvv case insensitive
        selectedProject = filteredProject.filter((project) => {
            let values = Object.values(project).join('\n').toLowerCase();
            return values.includes(query.toLowerCase());
        });

        // render updated projects
        renderProjects(selectedProject, projectsContainer, 'h2');

        renderPieChart(selectedProject);

        // // update the usable year filter
        // svg = d3.select('svg');

        // // svg.selectAll('path').remove();
        // arcs.forEach((arc, i) => {
        //     svg.on('click', () => {
        //             selectedIndex = selectedIndex === i ? -1 : i;

        //             // highlight selected wedge
        //             svg.selectAll('path')
        //             .attr('class', (_, idx) => (
        //                 // filter idx to find correct pie slice and apply CSS from above
        //                 selectedIndex === idx ? 'selected': null
        //             ));

        //             // highlight selected legend
        //             legend.selectAll('li')
        //                 .attr('class', (_,idx) => (
        //                     // filter idx to find correct legend and apply CSS from above
        //                     selectedIndex === idx ? 'selected' : 'swatch-point'
        //                 ));

        //             // update filtered project by selected year
        //             if (selectedIndex === -1) {
        //                 renderProjects(selectedProject, projectsContainer, 'h2');
        //                 filteredProject = projects;
        //             } else {
        //                 data.forEach((d,idx) => {
        //                     if (selectedIndex === idx){
        //                         filteredProject = selectedProject.filter((project) => project.year.includes(d.label));

        //                         renderProjects(filteredProject, projectsContainer, 'h2');
        //                     }
        //                 });
                        
        //             }
        //         });
        // });


    }

});

// filter by year
let selectedIndex = -1;

// vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv // only be initialized and can be used when the page refresh
let svg = d3.select('svg');    

svg.selectAll('path').remove();
arcs.forEach((arc, i) => {
    svg.append('path')
        .attr('d', arc)
        .attr('fill', colors(i))
        .on('click', () => {
            selectedIndex = selectedIndex === i ? -1 : i;

            // highlight selected wedge
            svg.selectAll('path')
               .attr('class', (_, idx) => (
                // filter idx to find correct pie slice and apply CSS from above
                selectedIndex === idx ? 'selected': null
               ));

            // highlight selected legend
            legend.selectAll('li')
                .attr('class', (_,idx) => (
                    // filter idx to find correct legend and apply CSS from above
                    selectedIndex === idx ? 'selected' : 'swatch-point'
                ));

            // update filtered project by selected year
            if (selectedIndex === -1) {
                renderProjects(selectedProject, projectsContainer, 'h2');
                filteredProject = projects;
            } else {
                data.forEach((d,idx) => {
                    if (selectedIndex === idx){
                        filteredProject = selectedProject.filter((project) => project.year.includes(d.label));

                        renderProjects(filteredProject, projectsContainer, 'h2');
                    }
                });
                
            }
        });
});
// ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^


// problem remained: 
// unknown bug- input something, like ee. select on the chart, the projects disappeared, click one more time, it appears
// intermedia state, like input "ww", select on the chart, cancel one "w", the selecting effect disappear, of course, empty the input, the selecting effect is correctly present.