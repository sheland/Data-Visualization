import * as controls from './controls.js';
import * as store from './store.js';
import * as util from './util.js';

const ROOT_ELEMENT_ID = 'app';
const DATA_FILE_URL = 'data/GBD_2017_death_rate_opioid_use_disorders_all_ages.csv';

/*
    Dataset where key is "year" value is array of rows
    {
      2007 : [{
        location: "Belize"
        lower: 0.09007127002844932
        mean: 0.11106562231873124
        sex: "Female"
        upper: 0.1343172356366983
      },
      {
        location: "Belize"
        lower: 0.09007127002844932
        mean: 0.11106562231873124
        sex: "Male"
        upper: 0.1343172356366983
      },
    }
*/

let _mainJson = null;

function transformCSVtoJson(csv) {
  _mainJson = {}; 

  for (let i = 0 ; i < csv.length; i++ ) {
    let dataPoint = csv[i];
    let year = dataPoint["year"];

    //{ 2007: [ ...], 2009: [...], 2010 [...]}
    // year => [ .. ]
    if ( year in _mainJson) {
      _mainJson[year].push(dataPoint);
    } else {
      _mainJson[year] = [];  // set an empty array to the key 
      _mainJson[year].push(dataPoint);
    }
  }

  console.log(_mainJson);
}


// Initialize application state using default control options.
store.setState(controls.initialState);

// Get a handle to the root element, in which we'll build the application.
const appContainer = document.getElementById(ROOT_ELEMENT_ID);

// Create UI controls and add to the DOM.
controls.create(appContainer);

// Add visualization container to the DOM. Visualization should be created inside this container.
const vizContainer = util.createElementWithAttributes('main', {
  id: 'viz',
  class: 'viz',
});
appContainer.appendChild(vizContainer);

/*
  Filter the main json based on the sex and the year that we want. 
*/
function filterDataSet(sex, year){
  let result = _mainJson[year].filter((d) => {
    if (d["sex"] == sex) {
      return true;
    }
    return false;
  });
  return result;
}

/*
  Barchart configurations



*/
var margin = {
  top:20,
  right:20,
  bottom:20,
  left: 20
};

// set the dimensions the chart
var width = 700 - margin.left - margin.right;
var height = 400 - margin.top - margin.bottom;

var xScale = d3.scaleBand().range([0, width]);
var yScale = d3.scaleLinear().range([height, 0]);


function refreshBarChart(data) {
  // empty out the contents of the #barchart
  document.getElementById("barchart").innerHTML = "";

  // render the Top 10 datapoints by mean 
  data.sort( (left, right) => {
    return (+right["mean"]) - (+left["mean"]);
  });

  console.log(data);

  let top10 = data.slice(0, 10); // take the top 10 


  // start creating the bar chart 
  let svg = d3.select("#barchart")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.right + ")");

  // maximum mean value 
  let yMax = d3.max(top10.map( (d) => d["mean"] ));

  // set domain
  xScale.domain(top10.map( (d) => d["location"]));
  yScale.domain([0, yMax]);

  // draw the bars
  svg.selectAll(".bar")
    .data(top10)
    .enter().append("rect")
    .attr("class", "bar")
    .attr("x", function(d) { return xScale(d.location)})
    .attr("width", xScale.bandwidth() - 10) // /10 pixels is the padding
    .attr("y", function(d) { return yScale(d.mean)})
    .attr("height", function(d) {return height - yScale(d.mean) });

  // append the xAxis
  svg.append("g")
    .attr("transform", "translate(0," + height+")")
    .call(d3.axisBottom(xScale));

  // append the y Axis
  svg.append("g").call(d3.axisLeft(yScale));
}


store.subscribe(function(update) {
  let sex = update["sex"];
  let year = update["year"];

  let data = filterDataSet(sex, year);
  refreshBarChart(data);
  
  /*

    a = [1,2,3]
    a = a.filter((d) => { if (d > 1) {
      return true; 
      else return false;
    }})
    a // [2,3]

    _mainJson[year].filter((d) => {
      if (d["sex"] == sex) {
        return true;
      }
      return false;
    });

  */
  // refreshWorldMap(sex, year);
});


(async function main() {
  try {
    const parsed = await util.loadCSVData(DATA_FILE_URL);

    // console.table(parsed.data.slice(0, 10));
    transformCSVtoJson(parsed.data);

    // refrsh bar chart just once, so that there's a default bar chart 
    let initData = filterDataSet(controls.initialState["sex"], controls.initialState["year"])
    
    refreshBarChart(initData);

    // TODO : Visualize the data!



  } catch (err) {
    vizContainer.textContent = 'Error loading data.';
  }
})();

