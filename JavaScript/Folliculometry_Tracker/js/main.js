
/* 
import differenceInDays from './date-day-library.js';
import addDaysToDate from './date-day-library.js';
import subDaysFromDate from './date-day-library.js';
 */

import { compareLocalAsc, addDaysToDate, subDaysFromDate, differenceInDays }  from './date-day-library.js';

// Declare variables and constants
const LUTEAL_PHASE_LENGTH = 14;
const dateLocales = undefined;
const dateOptions = {weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',};
let cyclesNum;
const menstrualInfo = {dateLMP: '', dateLMPStr: '', longestCycleLength: 0, shortestCycleLength: 0, averageCycleLength: 0, longestDayOvulation: 0, shortestDayOvulation: 0, averageDayOvulation: 0, predictedOvulationDate: '', predictedOvulationDateStr: '', currentCycleEndDate: '', currentCycleEndDateStr: '', alreadyOvulated: '',};
const datesCollectorArray = [];
let dateLMP;
let dateLMPStr = '';
let longestCycleLength = 0;
let shortestCycleLength = 0;
let averageCycleLength = 0;
let longestDayOvulation = 0;
let shortestDayOvulation = 0;
let averageDayOvulation = 0;
let predictedOvulationDate;
let predictedOvulationDateStr = '';
let alreadyOvulated = '';
let currentCycleEndDate;

const sectionCyclesNumElement = document.querySelector('#cycles-form-num');
const sectionCyclesDatesElement = document.querySelector('#cycles-form-date');
const cyclesFormElement = document.querySelector('#form-cycles-num');
// const cyclesSelectElement = document.querySelector('#cycles-num__select');
const datesFormElement = document.querySelector('#form-cycles-date');
const dateListElement = document.querySelector('#cycles-date-list');
const datesResetButtonElement = document.querySelector('#cycles-date__reset');
const sectionResultsElement = document.querySelector('#results');
const resultCellsElements = document.querySelectorAll('.result-table__value');
const sectionChartsElement = document.querySelector('#charts');
const resultsElement = document.querySelector('#calc-result');
const chartsElement = document.querySelector('calc-charts');


// Handle selecting number of start dates
cyclesFormElement.addEventListener('submit', function handleCyclesFormSubmit(event) {
  event.preventDefault();
  if (!event.target.matches('#form-cycles-num')) {
    return;
  }
  const data = new FormData(event.target);
  
  for (const [name,value] of data) {
    cyclesNum = value;
  }
  cyclesNum = parseInt(cyclesNum, 10);

  createDateInputs();
  cyclesFormElement.reset();
  sectionCyclesNumElement.classList.toggle('hidden-all');
  return cyclesNum;
});

// Create more date input elements and add to document
function createDateInputs() {
  let numDateInputs = cyclesNum;

  if (isNaN(numDateInputs)) {
    return;
  }

  if (numDateInputs > 2) {
    const fragment = document.createDocumentFragment();
    let counter = numDateInputs;
    let item = 2;
    while (counter > 2) {
      let liNum = `${item + 1}`;
      let newDateListElement = document.createElement('li');
      newDateListElement.innerHTML = `
        <label for="cycles-date__input-${liNum}">Start date-${liNum}:</label>
        <input type="date" name="flowstart-${liNum}" class="cycles-date__input" id="cycles-date__input-${liNum}" data-date="flowstart" required>
      `;
      newDateListElement.id = `cycles-date__item-${liNum}`;
      newDateListElement.class = 'cycles-date__item';
      fragment.appendChild(newDateListElement);

      item++;
      counter--;
    }
    dateListElement.appendChild(fragment);
  }
}

// Validate date inputs client side


// Handle dates form submission
function handleDateSubmit() {
  datesFormElement.addEventListener('submit', event => {
    event.preventDefault();
    // console.log(event.target);
    if (!event.target.matches('#form-cycles-date')) {
      return;
    }

    // Function to get the LMP
    function getLMP(datesArray) {
      while (!datesArray) {
        continue;
      }
      let lastItem = datesArray.slice(-1)[0];
      // console.log(lastItem);
      dateLMP = lastItem;
      // console.log(dateLMP);
      menstrualInfo.dateLMP = dateLMP;
      dateLMPStr = dateLMP.toLocaleString(dateLocales, dateOptions);
      menstrualInfo.dateLMPStr = dateLMP.toLocaleString(dateLocales, dateOptions);
      return dateLMP, dateLMPStr;
    }

    function extractDate() {
      for (const {key, valueAsDate} of event.target) {
        if (valueAsDate) {
          // console.log(valueAsDate);
          datesCollectorArray.push(valueAsDate);
        }
      }
      getLMP(datesCollectorArray);
      return datesCollectorArray;
    }
    
    function getDayDiff() {
      extractDate();
      let dayDiffArray;
      let dayDiffArrayTemp = [];
      for (let i = 0; i < datesCollectorArray.length - 1; i++) {
        dayDiffArrayTemp.push(differenceInDays(datesCollectorArray[i], datesCollectorArray[i + 1]));
      }
      
      dayDiffArray = dayDiffArrayTemp;
      dayDiffArrayTemp = null;
      console.log(dayDiffArray);
      return dayDiffArray;
    }
    
    let arrDayDiff = getDayDiff();
    datesResetButtonElement.click();

    calcMenstrualParameters(arrDayDiff, menstrualInfo);
    console.log(menstrualInfo);
  });
  // sectionCyclesDatesElement.classList.toggle('hidden-all');
}

// Process the date inputs

function longestCycleLengthCalc (datesArray, infoObj) {
  
  longestCycleLength = Math.max(...datesArray);
  
  infoObj.longestCycleLength = Math.max(...datesArray);
  
  return infoObj;
}

function shortestCycleLengthCalc(datesArray, infoObj) {
  shortestCycleLength = Math.min(...datesArray);
  
  infoObj.shortestCycleLength = Math.min(...datesArray);
  
  return infoObj;
}

function averageCycleLengthCalc(datesArray, infoObj) {
  averageCycleLength = Math.round(datesArray.reduce((avg, value, _, arr) => avg + (value / arr.length), 0));
  
  infoObj.averageCycleLength = Math.round(datesArray.reduce((avg, value, _, arr) => avg + (value / arr.length), 0));

  return infoObj;
}

function longestDayToOvulateCalc(datesArray, infoObj) {
  longestDayOvulation = longestCycleLength - LUTEAL_PHASE_LENGTH;
  
  infoObj.longestDayOvulation = longestCycleLength - LUTEAL_PHASE_LENGTH;

  return infoObj;
}

function shortestDayToOvulateCalc(datesArray, infoObj) {
  shortestDayOvulation = shortestCycleLength - LUTEAL_PHASE_LENGTH;

  infoObj.shortestDayOvulation = shortestCycleLength - LUTEAL_PHASE_LENGTH;

  return infoObj;
}

function averageDayToOvulateCalc(datesArray, infoObj) {
  averageDayOvulation = averageCycleLength - LUTEAL_PHASE_LENGTH;

  infoObj.averageDayOvulation = averageCycleLength - LUTEAL_PHASE_LENGTH;

  return infoObj;
}

function determineOvulationDate(datesArray, infoObj) {
  const todayDate = new Date();
  
  let currentLMP = infoObj.dateLMP;
  let avgCycleLen = averageCycleLength;
  
  let currentCycleEndDate = addDaysToDate(currentLMP, avgCycleLen);
  infoObj.currentCycleEndDate = currentCycleEndDate;
  infoObj.currentCycleEndDateStr = currentCycleEndDate.toLocaleString(dateLocales, dateOptions);
  
  let predictedDate = subDaysFromDate(currentCycleEndDate, LUTEAL_PHASE_LENGTH);
  // console.log(predictedDate);

  if (compareLocalAsc(predictedDate, todayDate) < 1) {
    alreadyOvulated = 'You would have ovulated!';
    infoObj.alreadyOvulated = 'You would have ovulated!';
  }

  console.log(compareLocalAsc(predictedDate, todayDate));

  infoObj.predictedOvulationDate = predictedDate;
  predictedOvulationDateStr = predictedDate.toLocaleString(dateLocales, dateOptions);

  infoObj.predictedOvulationDateStr = predictedDate.toLocaleString(dateLocales, dateOptions);

  // console.log(infoObj);
  return infoObj;
}

function calcMenstrualParameters(datesArray, infoObj) {
  longestCycleLengthCalc (datesArray, infoObj);
  shortestCycleLengthCalc(datesArray, infoObj);
  averageCycleLengthCalc(datesArray, infoObj);
  longestDayToOvulateCalc(datesArray, infoObj);
  shortestDayToOvulateCalc(datesArray, infoObj);
  averageDayToOvulateCalc(datesArray, infoObj);
  determineOvulationDate(datesArray, infoObj);
  return menstrualInfo;
}

// Return results to page


// Create charts

createDateInputs();
handleDateSubmit();