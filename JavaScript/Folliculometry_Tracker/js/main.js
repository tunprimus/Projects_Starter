
/* 
import differenceInDays from './date-day-library.js';
import addDaysToDate from './date-day-library.js';
import subDaysFromDate from './date-day-library.js';
 */

import { geometricMeanLogReduce }  from './geometric_mean.js';
import { compareLocalAsc, addDaysToDate, subDaysFromDate, differenceInCalendarDays }  from './date-day-library.js';

// Declare variables and constants
const LUTEAL_PHASE_LENGTH = 14;
const MENSES_SHIFT = 1; // Because there is no day 0 on the menstrual cycle
// const dateLocales = undefined;
const dateLocales = undefined || 'en-GB';
const dateOptions = {weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',};

let cyclesNum;
const menstrualInfo = {numCyclesGiven: '', dateLMP: '', dateLMPStr: '', longestCycleLength: '', longestCycleLengthStr: '',shortestCycleLength: '', shortestCycleLengthStr: '', averageCycleLength: '', averageCycleLengthStr: '', longestDayOvulation: '', longestDayOvulationStr: '', shortestDayOvulation: '', shortestDayOvulationStr: '', averageDayOvulation: '', averageDayOvulationStr: '', predictedOvulationDate: '', predictedOvulationDateStr: '', currentCycleEndDate: '', currentCycleEndDateStr: '', alreadyOvulated: '',};
const datesCollectorArray = [];
let numCyclesGiven;
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
const resultTableBodyElement = document.querySelector('.result-table__body');
// console.log(resultTableBodyElement);
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
  sectionCyclesNumElement.classList.toggle('hide-all');
  return cyclesNum;
});

// Create more date input elements and add to document
function createDateInputs() {
  let numDateInputs = cyclesNum;

  if (isNaN(numDateInputs)) {
    return;
  }

  if (numDateInputs > 2) {
    const fragment1 = document.createDocumentFragment();
    let counter = numDateInputs;
    let item = 2;
    while (counter > 2) {
      let liNum = `${item + 1}`;
      let newDateListElement = document.createElement('li');
      newDateListElement.innerHTML = `
        <label for="cycles-date__input-${liNum}">Start date-${liNum}:</label>
        <input type="date" name="flowstart-${liNum}" class="cycles-date__input input" id="cycles-date__input-${liNum}" data-date="flowstart" required>
      `;
      newDateListElement.id = `cycles-date__item-${liNum}`;
      newDateListElement.class = 'cycles-date__item';
      fragment1.appendChild(newDateListElement);

      item++;
      counter--;
    }
    dateListElement.appendChild(fragment1);
  }
}

// Validate date inputs client side


// Handle dates form submission
function handleDateSubmit() {
  datesFormElement.addEventListener('submit', event => {
    event.preventDefault();
    
    if (!event.target.matches('#form-cycles-date')) {
      return;
    }

    // Function to get the LMP
    function getLMP(datesArray) {
      while (!datesArray) {
        continue;
      }
      let lastItem = datesArray.slice(-1)[0];
      
      dateLMP = lastItem;
      
      menstrualInfo.dateLMP = dateLMP;
      dateLMPStr = dateLMP.toLocaleString(dateLocales, dateOptions);
      menstrualInfo.dateLMPStr = dateLMP.toLocaleString(dateLocales, dateOptions);
      return dateLMP, dateLMPStr;
    }

    function extractDate() {
      for (const {key, valueAsDate} of event.target) {
        if (valueAsDate) {
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
        dayDiffArrayTemp.push(differenceInCalendarDays(datesCollectorArray[i], datesCollectorArray[i + 1]));
      }
      
      dayDiffArray = dayDiffArrayTemp;
      dayDiffArrayTemp = null;
      
      numCyclesGiven = dayDiffArray.length;
      return dayDiffArray;
    }
    
    let arrDayDiff = getDayDiff();
    menstrualInfo.numCyclesGiven = arrDayDiff.length;
    datesResetButtonElement.click();
    // console.log(arrDayDiff);
    calcMenstrualParameters(arrDayDiff, menstrualInfo);
    
    sectionCyclesDatesElement.classList.toggle('hide-all');

    generateTableResults(resultTableBodyElement, menstrualInfo);
    sectionResultsElement.classList.toggle('hide-all');
  });
  
}

// Process the date inputs

function longestCycleLengthCalc (dayDiffArr, infoObj) {
  if (!Array.isArray(dayDiffArr)) {
    return;
  }
  const arrLen = dayDiffArr.length;
  longestCycleLength = Math.max(...dayDiffArr);
  
  infoObj.longestCycleLength = Math.max(...dayDiffArr);

  // Comparison only if there are 2 or more cycles
  if (arrLen < 2) {
    infoObj.longestCycleLength = '';
  }
  
  return infoObj;
}

function shortestCycleLengthCalc(dayDiffArr, infoObj) {
  if (!Array.isArray(dayDiffArr)) {
    return;
  }
  const arrLen = dayDiffArr.length;
  shortestCycleLength = Math.min(...dayDiffArr);
  
  infoObj.shortestCycleLength = Math.min(...dayDiffArr);

  // Comparison only if there are 2 or more cycles
  if (arrLen < 2) {
    infoObj.shortestCycleLength = '';
  }
  
  return infoObj;
}

function averageCycleLengthCalc(dayDiffArr, infoObj) {
  if (!Array.isArray(dayDiffArr)) {
    return;
  }
  averageCycleLength = Math.round(dayDiffArr.reduce((avg, value, _, arr) => avg + (value / arr.length), 0));
  
  infoObj.averageCycleLength = Math.round(dayDiffArr.reduce((avg, value, _, arr) => avg + (value / arr.length), 0));

  return infoObj;
}

function longestDayToOvulateCalc(dayDiffArr, infoObj) {
  if (!Array.isArray(dayDiffArr)) {
    return;
  }
  const arrLen = dayDiffArr.length;
  longestDayOvulation = longestCycleLength - LUTEAL_PHASE_LENGTH;
  
  infoObj.longestDayOvulation = longestCycleLength - LUTEAL_PHASE_LENGTH;

  // Comparison only if there are 2 or more cycles
  if (arrLen < 2) {
    infoObj.longestDayOvulation = '';
  }

  return infoObj;
}

function shortestDayToOvulateCalc(dayDiffArr, infoObj) {
  if (!Array.isArray(dayDiffArr)) {
    return;
  }
  const arrLen = dayDiffArr.length;
  shortestDayOvulation = shortestCycleLength - LUTEAL_PHASE_LENGTH;

  infoObj.shortestDayOvulation = shortestCycleLength - LUTEAL_PHASE_LENGTH;

  // Comparison only if there are 2 or more cycles
  if (arrLen < 2) {
    infoObj.shortestDayOvulation = '';
  }

  return infoObj;
}

function averageDayToOvulateCalc(dayDiffArr, infoObj) {
  averageDayOvulation = averageCycleLength - LUTEAL_PHASE_LENGTH;

  infoObj.averageDayOvulation = averageCycleLength - LUTEAL_PHASE_LENGTH;

  return infoObj;
}

function determineOvulationDate(infoObj) {
  const todayDate = new Date();
  
  let currentLMP = infoObj.dateLMP;
  let avgCycleLen = averageCycleLength;
  
  let currentCycleEndDate = addDaysToDate(currentLMP, (avgCycleLen - MENSES_SHIFT));
  infoObj.currentCycleEndDate = currentCycleEndDate;
  infoObj.currentCycleEndDateStr = currentCycleEndDate.toLocaleString(dateLocales, dateOptions);
  
  let predictedDate = subDaysFromDate(currentCycleEndDate, LUTEAL_PHASE_LENGTH);

  if (compareLocalAsc(predictedDate, todayDate) < 1) {
    alreadyOvulated = 'You would have ovulated!';
    infoObj.alreadyOvulated = 'You would have ovulated!';
  }

  infoObj.predictedOvulationDate = predictedDate;
  predictedOvulationDateStr = predictedDate.toLocaleString(dateLocales, dateOptions);

  infoObj.predictedOvulationDateStr = predictedDate.toLocaleString(dateLocales, dateOptions);

  return infoObj;
}

function calcMenstrualParameters(dayDiffArr, infoObj) {
  if (!Array.isArray(dayDiffArr)) {
    return;
  }
  longestCycleLengthCalc (dayDiffArr, infoObj);
  shortestCycleLengthCalc(dayDiffArr, infoObj);
  averageCycleLengthCalc(dayDiffArr, infoObj);
  longestDayToOvulateCalc(dayDiffArr, infoObj);
  shortestDayToOvulateCalc(dayDiffArr, infoObj);
  averageDayToOvulateCalc(dayDiffArr, infoObj);
  determineOvulationDate(infoObj);
  return infoObj;
}

// Return results to page
function generateTableResults(tbodyDom, infoObj) {
  
  if (!tbodyDom) {
    return;
  }
  const newInnerHTML = `
    <tr> <td class="result-table__desc" data-label="Number of cycles: ">Number of cycles: </td> <td class="result-table__value" data-label="Number of cycles: "> ${infoObj.numCyclesGiven}</td> </tr> <tr> <td class="result-table__desc" data-label="Last Menstrual Period: ">Last Menstrual Period: </td> <td class="result-table__value" data-label="Last Menstrual Period: "> ${infoObj.dateLMPStr}</td> </tr> <tr> <td class="result-table__desc" data-label="Longest cycle length: ">Longest cycle length: </td> <td class="result-table__value" data-label="Longest cycle length: "> ${infoObj.longestCycleLength} days</td> </tr> <tr> <td class="result-table__desc" data-label="Shortest cycle length: ">Shortest cycle length: </td> <td class="result-table__value" data-label="Shortest cycle length: ">${infoObj.shortestCycleLength} days</td> </tr> <tr> <td class="result-table__desc" data-label="Averaged cycle length: ">Averaged cycle length: </td> <td class="result-table__value" data-label="Averaged cycle length: "> ${infoObj.averageCycleLength} days</td> </tr> <tr> <td class="result-table__desc" data-label="Longest day of ovulation: ">Longest day of ovulation: </td> <td class="result-table__value" data-label="Longest day of ovulation: "> Day ${infoObj.longestDayOvulation}</td> </tr> <tr> <td class="result-table__desc" data-label="Shortest day of ovulation: ">Shortest day of ovulation: </td> <td class="result-table__value" data-label="Shortest day of ovulation: "> Day ${infoObj.shortestDayOvulation}</td> </tr> <tr> <td class="result-table__desc" data-label="Average day of ovulation: ">Average day of ovulation: </td> <td class="result-table__value alert" data-label="Average day of ovulation: "> Day ${infoObj.averageDayOvulation}</td> </tr> <tr> <td class="result-table__desc" data-label="Predicted Ovulation Date: ">Predicted Ovulation Date: </td> <td class="result-table__value warning" data-label="Predicted Ovulation Date: "> <strong>${infoObj.predictedOvulationDateStr}</strong></td> </tr> <tr> <td class="result-table__desc" data-label="Ovulated?: "></td> <td class="result-table__value alert-message alert" data-label="Ovulated?: "> ${infoObj.alreadyOvulated}</td> </tr>
  `;
  
  tbodyDom.innerHTML = '';
  tbodyDom.innerHTML += newInnerHTML;
  return tbodyDom;
}

createDateInputs();
handleDateSubmit();

// Create charts
