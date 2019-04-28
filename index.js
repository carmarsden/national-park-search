'use strict';

/* Requirements:
√ The user must be able to search for parks in one or more states.
√ The user must be able to set the max number of results, with a default of 10.
√ The search must trigger a call to NPS's API.
√ The parks in the given state must be displayed on the page. Include at least: Full name, Description, Website URL
√ The user must be able to make multiple searches and see only the results for the current search.
√ As a stretch goal, try adding the park's address to the results. */

const apiKey = 'KQeTJvetqICrdtfRfkMn7E6jaBzztbiwMKxQmzTg'; 
const baseURL = 'https://developer.nps.gov/api/v1/parks';

function formatPhysicalAddress(addressArray) {
  const physicalAddressObj = addressArray.find(address => address.type === "Physical");

  let physAddressString = `${physicalAddressObj.line1}<br>`;
  if (physicalAddressObj.line2 !== '') {
    physAddressString = physAddressString + `${physicalAddressObj.line2}<br>`
  };
  if (physicalAddressObj.line3 !== '') {
    physAddressString = physAddressString + `${physicalAddressObj.line3}<br>`
  };
  physAddressString = physAddressString + `${physicalAddressObj.city}, ${physicalAddressObj.stateCode} ${physicalAddressObj.postalCode}`;

  return physAddressString;
}

function displayResults(responseJson) {
  console.log(responseJson);
  for (let i = 0; i < responseJson.data.length; i++){
    const physicalAddress = formatPhysicalAddress(responseJson.data[i].addresses);
    $('#results-list').append(
      `<li><h3>Name: ${responseJson.data[i].fullName}</h3>
      <p>Website: <a href="${responseJson.data[i].url}" target="_blank">${responseJson.data[i].url}</a></p>
      <p>Address: ${physicalAddress}</p>
      <p>Description: ${responseJson.data[i].description}</p>
      <img src='${responseJson.data[i].images[0].url}' class="resultsimg">
      </li>`
    )};
  $('#results').removeClass('hidden');
};

function formatQueryParams(params) {
  const queryItems = Object.keys(params)
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
  return queryItems.join('&');
}

function getParks(searchState, maxResults=10) {
  const params = {
    api_key: apiKey,
    stateCode: searchState,
    limit: maxResults,
    fields: 'images,addresses',
  };
  const queryString = formatQueryParams(params);
  const url = baseURL + '?' + queryString;

  console.log(url);

  fetch(url)
    .then(response => {
      if (response.ok) {
        return response.json();
      }
      throw new Error(response.statusText);
    })
    .then(responseJson => {
        if (responseJson.total === "0") {
            $('#js-error-message').text(`No results found! Make sure you are searching for one more US states using their two-letter state abbreviation, separated only by a comma`);
        } else {
        displayResults(responseJson)
        }
    })
    .catch(err => {
      $('#js-error-message').text(`Something went wrong: ${err.message}`);
    });
}

function watchForm() {
  $('form').submit(event => {
    event.preventDefault();
    const searchState = $('#js-search-state').val().replace(/\s/g,'');
    const maxResults = $('#js-max-results').val();
    $('#results-list').empty();
    $('#js-error-message').empty();  
    getParks(searchState, maxResults);
  });
}

$(watchForm);