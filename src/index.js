import * as controls from './controls.js';
import * as store from './store.js';
import * as util from './util.js';

const ROOT_ELEMENT_ID = 'app';
const DATA_FILE_URL = 'data/GBD_2017_death_rate_opioid_use_disorders_all_ages.csv';

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

(async function main() {
  try {
    const parsed = await util.loadCSVData(DATA_FILE_URL);

    console.table(parsed.data.slice(0, 10));

    // TODO : Visualize the data!

  } catch (err) {
    vizContainer.textContent = 'Error loading data.';
  }
})();
