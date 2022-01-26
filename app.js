// DOM Variables
const flightResultContainer = document.querySelector(
  ".flight-result-container"
);
const fromInput = document.querySelector(".from-input");
const toInput = document.querySelector(".to-input");
const submitBtn = document.querySelector(".submit-btn");
const loadMoreResults = document.querySelector(".load-more-results");
const msgContainer = document.querySelector(".msg-container");
const countryAlert = document.querySelector(".country-alert");

// global variabels

let isSearch = false;
let flightCounter = 0;
// when user search for flights, the filtered data will placed in here.
let localFilteredData = [];
let dataMock = [];

// === UI Functions === //

// Create a DOM Element & If we have a classList or TextContent, refer it to the element.
// Then return the element.
function createUIElement(elementType, classList, textContent) {
  let element = document.createElement(elementType);
  if (classList) {
    element.classList = classList;
  }
  if (textContent) {
    element.textContent = textContent;
  }
  return element;
}

function createFlightDetails(data) {
  let flightContent = createUIElement(
    "div",
    "d-flex w-50 justify-content-between border flight"
  );
  let logo = createImg();

  let airlineContent = createUIElement("div", "d-flex flex-column w-50");
  let flightNumber = createUIElement(
    "span",
    "",
    `Flight number: ${data.flight.number}`
  );
  let airline = createUIElement(
    "span",
    "",
    `Airline company: ${data.airline.name}`
  );

  airlineContent.append(...[airline, flightNumber]);

  let depart = createInnerFlightDetails(
    extractFlightTime(data.departure.estimated),
    data.departure.iata,
    data.flight_date
  );
  let arrival = createInnerFlightDetails(
    extractFlightTime(data.arrival.estimated),
    data.arrival.iata,
    data.flight_date
  );
  flightContent.append(...[logo, airlineContent, depart, arrival]);

  flightResultContainer.appendChild(flightContent);
}

function createImg() {
  let image = createUIElement("img");
  image.src = "assets/flights-logo.jpeg";
  image.setAttribute("width", "70");
  image.setAttribute("height", "70");
  return image;
}

// The function will create a div with three inner children: time, airport, date.
// Append the inner children to the div.
// Return div element.

function createInnerFlightDetails(time, airport, date) {
  let div = createUIElement("div", "d-flex flex-column justify-content-center");

  let flightHour = createUIElement("span", "", time);
  let flightLocation = createUIElement("span", "", airport);
  let flightDate = createUIElement("span", "", date);

  div.append(...[flightHour, flightLocation, flightDate]);
  return div;
}

function deleteUi() {
  let flightElements = document.querySelectorAll(".flight");
  flightElements.forEach(function (element) {
    element.remove();
  });
}

// === Functional Functions ===

function filterLocation(depart, arrival, data) {
  let filteredData = data.filter(obj => {
    return obj.departure.iata === depart && obj.arrival.iata === arrival;
  });
  console.log(filteredData);
  return filteredData;
}
// the function get an full date string, convert it to Date object.
// then extract the hours and minutes
// return full time with timezone(AM\PM)
function extractFlightTime(fullDateString) {
  let fullDate = new Date(fullDateString);
  let extractHours = fullDate.getHours();
  let extractMinutes = fullDate.getMinutes();
  let timezone;

  // check timezone
  if (extractHours < 12) {
    timezone = "AM";
  } else {
    timezone = "PM";
  }
  // check the hours and the minutes for proper visibility.
  if (extractHours < 10) {
    extractHours = "0" + extractHours;
  }

  if (extractMinutes < 10) {
    extractMinutes = "0" + extractMinutes;
  }
  let resultTime = `${extractHours}:${extractMinutes} ${timezone}`;
  return resultTime;
}

function loadResults(data) {
  for (let i = 0; i < 3; i++) {
    if (data[flightCounter]) {
      createFlightDetails(data[flightCounter]);
      flightCounter++;
    }
  }

  if (flightCounter >= data.length) {
    msgContainer.textContent = "No more results to show.";
    loadMoreResults.style.display = "none";
  } else {
    msgContainer.textContent = "";
    loadMoreResults.style.display = "inline-block";
  }
}
loadMoreResults.addEventListener("click", () => {
  checkSearch();
});

function checkSearch(fromValue, toValue) {
  if (isSearch) {
    // filter the data
    localFilteredData = filterLocation(toValue, fromValue, dataMock);
    loadResults(localFilteredData);
  } else {
    loadResults(dataMock);
  }
}

submitBtn.addEventListener("click", function (event) {
  event.preventDefault();
  let toValue = toInput.value;
  let fromValue = fromInput.value;

  // reset the counter and remove existing elements from the page.
  deleteUi();
  flightCounter = 0;

  // if any of the inputs are empty , reload the page with all results.
  if (toValue == "" || fromValue == "") {
    isSearch = false;
    handleAsyncData();
  } else {
    // isSearch flag is on
    isSearch = true;

    // load the results
    handleAsyncData(toValue, fromValue);

    // clear inputs
    toInput.value = "";
    fromInput.value = "";
  }
});

function handleAsyncData(toValue, fromValue) {
  const API_KEY = "79e3624e640f83c68fa4e30a24947f97";
  // Fetch function that handles the API data.
  async function fetchData() {
    let API_URL = `http://api.aviationstack.com/v1/flights?access_key=${API_KEY}`;
    let response = await fetch(API_URL);
    let parsedData = await response.json();
    return parsedData;
  }
  // We call the async function, then we assign the received data into local variable --> dataMock.
  // After that, we load the results with the data we received.
  fetchData().then(obj => {
    dataMock = obj.data;
    // We check if search flag is on and either way we load the results.
    checkSearch(toValue, fromValue);
  });
}

// Initialze the page.
handleAsyncData();
