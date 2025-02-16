// Displaying summary stats
let data = [];
let commits = [];
let brushSelection = null;
let xScale = 0;
let yScale = 0;

async function loadData() {
    data = await d3.csv('loc.csv', (row) => ({
        ...row,
        line: Number(row.line), // or just +row.line
        depth: Number(row.depth),
        length: Number(row.length),
        data: new Date(row.data + 'T00:00' + row.timezone),
        datetime: new Date(row.datetime),
    }));
    // console.log(data);
}

document.addEventListener('DOMContentLoaded', async () => {
    await loadData();

    displayStats();
    createScatterplot();

    // enable brush rectangle to do multiple selection
    brushSelector();
    // console.log(commits);
});


function processCommits() {
    commits = d3
      .groups(data, (d) => d.commit)
      .map(([commit, lines]) => {
        // Each 'lines' array contains all lines modified in this commit
        // All lines in a commit have the same author, date, etc.
        // So we can get this information from the first line
        let first = lines[0];
        let { author, date, time, timezone, datetime } = first;
        let ret = {
            id: commit,
            url: 'https://github.com/vis-society/lab-7/commit/' + commit,
            author,
            date,
            time,
            timezone,
            datetime,
            hourFrac: datetime.getHours() + datetime.getMinutes() / 60,
            totalLines: lines.length,
        };

        Object.defineProperty(ret, 'lines', {
            value: lines,
            // when it looks light pink, then it is hidden
            writeable: true,
            enumerable: false,
            configurable: true,
        });

        return ret;
    });
}

// I used the fool way to do, better to check out Step 1.3
function displayStats() {
    // Process commits first
    processCommits();

    // Create the dl element
    const dl = d3.select('#stats').append('dl').attr('class', 'stats');

    // Add total LOC
    dl.append('dt').html('Total <abbr title="Lines of code">LOC</abbr>');
    dl.append('dd').text(data.length);

    // Add total commits
    dl.append('dt').text('Total commits');
    dl.append('dd').text(commits.length);

    // Add max total line commit
    dl.append('dt').text('Max total line commit');
    dl.append('dd').text(()=>{
        let maxTotalLine = 0;
        for (commit of commits){
            if (maxTotalLine < commit.totalLines){
                maxTotalLine = commit.totalLines;
            }
        }
        return maxTotalLine;
    });

    // Add Most work done in the
    dl.append('dt').text('Most work done in the');
    dl.append('dd').text(()=>{
        let daytime = [0,0,0,0]; //morning, afternoon, evening, night
        for (let commit of commits){
            if (commit.hourFrac < 6) {
                daytime[0]++; // night
            } else if (commit.hourFrac < 12) {
                daytime[1]++; // morning
            } else if (commit.hourFrac < 18) {
                daytime[2]++; // afternoon
            } else {
                daytime[3]++; // evening
            }
        }
        let maxIndex = daytime.indexOf(Math.max(...daytime));
        return ['Night', 'Morning', 'Afternoon', 'Evening'][maxIndex];
    });

    // Add Most work done on
    dl.append('dt').text('Most work done on');
    dl.append('dd').text(()=>{
        let dayCounts = [0,0,0,0,0,0,0]; //Sun, Mon, Tue, Wed, Thr, Fri, Sat
        for (let commit of commits){
            let day = commit.datetime.getDay();
            dayCounts[day]++;
        }
        let maxDayIndex = dayCounts.indexOf(Math.max(...dayCounts));
        return ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][maxDayIndex];
    });

    // Add more stats as needed...
}

// Visualize by chart
// drawing data point, dots
function createScatterplot(){
    const width = 1000;
    const height = 600;
    // define usable area to draw
    const margin = {top:10, right:10, bottom:30, left:20};
    const usableArea = {
        top: margin.top,
        right: width - margin.right,
        bottom: height - margin.bottom,
        left: margin.left,
        width: width - margin.left - margin.right,
        height: height - margin.top - margin.bottom,
    };
    // connect lines edited via dot size
    const [minLines, maxLines] = d3.extent(commits, (d) => d.totalLines);
    const rScale = d3.scaleSqrt().domain([minLines, maxLines]).range([8,30]);
    // sort commits by total lines in descending order, prevent hardship select circle with small commit lines
    const sortedCommits = d3.sort(commits, (d) => -d.totalLines);

    const svg = d3
                .select('#chart')
                .append('svg')
                .attr('viewBox', `0 0 ${width} ${height}`)
                .style('overflow','visible');
    
    xScale = d3
            .scaleTime()
            .domain(d3.extent(commits, (d) => d.datetime))
            .range([0,width])
            .nice();
    yScale = d3.scaleLinear().domain([0,24]).range([height,0]);

    // Update scales with new ranges
    xScale.range([usableArea.left, usableArea.right]);
    yScale.range([usableArea.bottom, usableArea.top]);


    const dots = svg.append('g').attr('class','dots');
    
    dots
        .selectAll('circle')
        .data(sortedCommits)  // use sortedCommits let large circle render first, so that the later render small circle could be choose easier
        .join('circle')
        .attr('cx',(d) => xScale(d.datetime))
        .attr('cy',(d) => yScale(d.hourFrac))
        .attr('r', (d) => rScale(d.totalLines))
        .style('fill-opacity',0.7)
        .attr('fill','steelblue')
        .on('mouseenter', (event, commit) => {  // add event to every dots
            updateTooltipContent(commit);
            updateTooltipVisibility(true);
            updateTooltipPosition(event);

            // retain full opacity when hover
            d3.select(event.currentTarget).style('fill-opacity',1);
        })
        .on('mouseleave', () => {
            // clear tooltip content
            updateTooltipContent({})
            updateTooltipVisibility(false);

            // revert back to non-hover opacity
            d3.select(event.currentTarget).style('fill-opacity',0.7);
        });


    // Add gridlines BEFORE the axes
    const gridlines = svg
                        .append('g')
                        .attr('class','gridlines')
                        .attr('transform',`translate(${usableArea.left},0)`);

    // Create gridlines as an axis with no labels and full-width ticks, 
    // recall: place that tickFormat put, is the place y-Axis time stamp put
    gridlines.call(d3.axisLeft(yScale).tickFormat('').tickSize(-usableArea.width));


    // Create the axes
    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yScale)
                    .tickFormat((d) => String(d % 24).padStart(2, '0') + ':00');
    
    // Add X axis
    svg
        .append('g')
        .attr('transform', `translate(0, ${usableArea.bottom})`)
        .call(xAxis);
    
    // Add Y axis
    svg
        .append('g')
        .attr('transform', `translate(${usableArea.left}, 0)`)
        .call(yAxis);

}

// tooptip controling funcitons
function updateTooltipContent(commit){
    const link = document.getElementById('commit-link');
    const date = document.getElementById('commit-date');
    const time = document.getElementById('commit-time');
    const author = document.getElementById('commit-author');
    const lines = document.getElementById('commit-lines');

    if (Object.keys(commits).length === 0) return;

    link.href = commit.url;
    link.textContent = commit.id;
    date.textContent = commit.datetime?.toLocaleString('en',{
        dateStyle: 'full',
    });
    time.textContent = commit.time;
    author.textContent = commit.author;
    lines.textContent = commit.totalLines;
}

function updateTooltipVisibility(isVisible){
    const tooltip = document.getElementById('commit-tooltip');
    tooltip.hidden = !isVisible;
}

function updateTooltipPosition(event){
    const tooltip = document.getElementById('commit-tooltip');
    tooltip.style.left = `${event.clientX}px`;
    tooltip.style.top = `${event.clientY}px`;
}

// brush multiple selection on circles
function brushSelector(){
    const svg = document.querySelector('svg');
    // Create brush
    d3.select(svg).call( d3.brush().on('start brush end', brushed) );

    // Raise dots and everything after overlay
    d3.select(svg).selectAll('.dots, .overlay ~ *').raise();
}

// use brush, the rect, to fire[trigger] event
function brushed(event) {
    brushSelection = event.selection;
    updateSelection();
    updateSelectionCount();
    updateLanguageBreakdown();
    // console.log(brushSelection);
}

function isCommitSelected(commit) {
    if (!brushSelection){
        return false;
    } else {
        // true if commit is within brushSelection and false if not
        let x = xScale(commit.datetime);
        let y = yScale(commit.hourFrac);
        if ( brushSelection[0][0] < x && 
            brushSelection[1][0] > x && 
            brushSelection[0][1] < y && 
            brushSelection[1][1] > y){
                return true;
        } else {
            return false;
        }
    }
}

function updateSelection() {
    // Update visual state of dots based on selection
    d3.selectAll('circle').classed('selected', (d) => isCommitSelected(d));     // CAUSION!!! selectAll('circle') provides original data not DOM object data
}

function updateSelectionCount(){
    const selectedCommits = brushSelection
    ? commits.filter(isCommitSelected)
    : [];

    const countElement = document.getElementById('selection-count');
    countElement.textContent = `${
        selectedCommits.length || 'No'
    } commits selected`;

    return selectedCommits;
}

function updateLanguageBreakdown(){
    const selectedCommits = brushSelection
    ? commits.filter(isCommitSelected)
    : [];
    const container =document.getElementById('language-breakdown');

    if (selectedCommits.length === 0){
        container.innerHTML = '';
        return;
    }
    const requiredCommits = selectedCommits.length ? selectedCommits : commits;
    const lines = requiredCommits.flatMap((d) => d.lines);

    // Use d3.rollup to count lines per language
    const breakdown = d3.rollup(
        lines,
        (v) => v.length,
        (d) => d.type
    );

    // Update DOM with breakdown
    container.innerHTML = '';

    for (const [language, count] of breakdown){
        const proportion = count / lines.length;
        const formatted = d3.format('.1~%')(proportion);

        container.innerHTML += `
                <dt>${language}</dt>
                <dd>${count} lines <br>(${formatted})</dd>
        `;
    }

    return breakdown;
}
