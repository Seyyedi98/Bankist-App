'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

/////////////////////////////////////////////////
// Data

// DIFFERENT DATA! Contains movement dates, currency and locale

const account1 = {
  owner: 'Jonas Schmedtmann',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2019-11-18T21:31:17.178Z',
    '2019-12-23T07:42:02.383Z',
    '2020-01-28T09:15:04.904Z',
    '2020-04-01T10:17:24.185Z',
    '2020-05-08T14:11:59.604Z',
    '2020-05-27T17:01:17.194Z',
    '2023-04-11T23:36:17.929Z',
    '2023-04-12T10:51:36.790Z',
  ],
  currency: 'EUR',
  locale: 'pt-PT', // de-DE
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2019-11-01T13:15:33.035Z',
    '2019-11-30T09:48:16.867Z',
    '2019-12-25T06:04:23.907Z',
    '2020-01-25T14:18:46.235Z',
    '2020-02-05T16:33:06.386Z',
    '2020-04-10T14:43:26.374Z',
    '2023-04-11T23:36:17.929Z',
    '2023-04-12T10:51:36.790Z',
  ],
  currency: 'USD',
  locale: 'en-US',
};

const accounts = [account1, account2];

/////////////////////////////////////////////////
// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

/////////////////////////////////////////////////
// Functions

const formatMovementDate = function (date, locale) {
  const calcDaysPassed = (date1, date2) =>
    Math.round(Math.abs(date2 - date1) / (1000 * 60 * 60 * 24));

  const daysPassed = calcDaysPassed(new Date(), date);
  // console.log(daysPassed);

  if (daysPassed === 0) return 'Today';
  if (daysPassed === 1) return 'Yesterday';
  if (daysPassed <= 7) return `${daysPassed} days ago`;
  else {
    return new Intl.DateTimeFormat(locale).format(date);

    // const day = `${date.getDate()}`.padStart(2, '0');
    // const month = `${date.getMonth()}`.padStart(2, '0');
    // const year = date.getFullYear();
    // return `${day}/${month}/${year}`;
  }
};

const displayMovements = function (acc, sort = false) {
  containerMovements.innerHTML = '';

  const movs = sort
    ? acc.movements.slice().sort((a, b) => a - b)
    : acc.movements;

  movs.forEach(function (mov, i) {
    const type = mov > 0 ? 'deposit' : 'withdrawal';

    const date = new Date(acc.movementsDates[i]);
    const displayDate = formatMovementDate(date, acc.locale);

    const html = `
      <div class="movements__row">
        <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>
        <div class="movements__date">${displayDate}</div>
        <div class="movements__value">${mov.toFixed(2)}€</div>
      </div>
    `;

    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

const calcDisplayBalance = function (acc) {
  acc.balance = acc.movements.reduce((acc, mov) => acc + mov, 0);
  labelBalance.textContent = `${acc.balance.toFixed(2)}€`;
};

const calcDisplaySummary = function (acc) {
  const incomes = acc.movements
    .filter(mov => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumIn.textContent = `${incomes.toFixed(2)}€`;

  const out = acc.movements
    .filter(mov => mov < 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumOut.textContent = `${Math.abs(out).toFixed(2)}€`;

  const interest = acc.movements
    .filter(mov => mov > 0)
    .map(deposit => (deposit * acc.interestRate) / 100)
    .filter((int, i, arr) => {
      // console.log(arr);
      return int >= 1;
    })
    .reduce((acc, int) => acc + int, 0);
  labelSumInterest.textContent = `${interest.toFixed(2)}€`;
};

const createUsernames = function (accs) {
  accs.forEach(function (acc) {
    acc.username = acc.owner
      .toLowerCase()
      .split(' ')
      .map(name => name[0])
      .join('');
  });
};
createUsernames(accounts);

const updateUI = function (acc) {
  // Display movements
  displayMovements(acc);

  // Display balance
  calcDisplayBalance(acc);

  // Display summary
  calcDisplaySummary(acc);
};

const startLogoutTimer = function () {
  const tick = function () {
    const min = String(Math.trunc(time / 60)).padStart(2, 0);
    const sec = String(time % 60).padStart(2, 0);

    // In each call, print the remaining time to the UI
    labelTimer.textContent = `${min}:${sec}`;

    // When timer expired, stop timer and logout user
    if (time === 0) {
      clearInterval(timer);

      labelWelcome.textContent = 'Log in to get started';
      containerApp.style.opacity = 0;
    }

    // Decrease 1s
    time--;
  };

  // Set time to 5 minuites
  let time = 600;

  // Call the timer every second
  tick();
  const timer = setInterval(tick, 1000);

  return timer; // return tumer, so we can remve it when another user logged in
};

///////////////////////////////////////
// Event handlers
let currentAccount, timer;

// FAKE AKWAYS LOGGED IN
// currentAccount = account1;
// updateUI(currentAccount);
// containerApp.style.opacity = 100;

btnLogin.addEventListener('click', function (e) {
  // Prevent form from submitting
  e.preventDefault();

  currentAccount = accounts.find(
    acc => acc.username === inputLoginUsername.value
  );
  // console.log(currentAccount);

  if (currentAccount?.pin === +inputLoginPin.value) {
    // Display UI and message
    labelWelcome.textContent = `Welcome back, ${
      currentAccount.owner.split(' ')[0]
    }`;
    containerApp.style.opacity = 100;

    // Set time
    // Create current date and time
    const now = new Date();
    const option = {
      hour: 'numeric',
      minute: 'numeric',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      weekday: 'long',
    };
    // labelDate.textContent = new Intl.DateTimeFormat(
    //   currentAccount.locale,
    //   option
    // ).format(now);

    // const day = `${now.getDate()}`.padStart(2, '0'); // Converted to string, Then can use padstart.
    // const month = `${now.getMonth()}`.padStart(2, '0');
    // const year = now.getFullYear();
    // const hour = `${now.getHours()}`.padStart(2, '0');
    // const min = `${now.getMinutes()}`.padStart(2, '0');
    // // D/M/Y
    // labelDate.textContent = `${day}/${month}/${year}, ${hour}:${min}`;

    // Clear input fields
    inputLoginUsername.value = inputLoginPin.value = '';

    inputLoginPin.blur();

    // Timer
    if (timer) clearInterval(timer);

    timer = startLogoutTimer();

    // Update UI
    updateUI(currentAccount);
  }
});

btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();
  const amount = +inputTransferAmount.value;
  const receiverAcc = accounts.find(
    acc => acc.username === inputTransferTo.value
  );
  inputTransferAmount.value = inputTransferTo.value = '';

  if (
    amount > 0 &&
    receiverAcc &&
    currentAccount.balance >= amount &&
    receiverAcc?.username !== currentAccount.username
  ) {
    // Doing the transfer
    currentAccount.movements.push(-amount);
    receiverAcc.movements.push(amount);

    // Add transfer date
    currentAccount.movementsDates.push(new Date().toISOString());
    receiverAcc.movementsDates.push(new Date().toISOString());

    // Update UI
    updateUI(currentAccount);

    // Reset timer
    clearInterval(timer);
    timer = startLogoutTimer();
  }
});

btnLoan.addEventListener('click', function (e) {
  e.preventDefault();

  const amount = Math.floor(+inputLoanAmount.value);

  if (amount > 0 && currentAccount.movements.some(mov => mov >= amount * 0.1)) {
    setTimeout(function () {
      // Add movement
      currentAccount.movements.push(amount);

      // Add loan date
      currentAccount.movementsDates.push(new Date().toISOString());

      // Update UI
      updateUI(currentAccount);

      // Reset timer
      clearInterval(timer);
      timer = startLogoutTimer();
    }, 5000);
  }
  inputLoanAmount.value = '';
});

btnClose.addEventListener('click', function (e) {
  e.preventDefault();

  if (
    inputCloseUsername.value === currentAccount.username &&
    +inputClosePin.value === currentAccount.pin
  ) {
    const index = accounts.findIndex(
      acc => acc.username === currentAccount.username
    );
    console.log(index);
    // .indexOf(23)

    // Delete account
    accounts.splice(index, 1);

    // Hide UI
    containerApp.style.opacity = 0;
  }

  inputCloseUsername.value = inputClosePin.value = '';
});

let sorted = false;
btnSort.addEventListener('click', function (e) {
  e.preventDefault();
  displayMovements(currentAccount, !sorted);
  sorted = !sorted;
});

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES

// -------------------------- Converting and checking numbers --------------------------

// console.log(23 === 23.0);

// In binary, 0.1 creates infinite fractoin. Just like 10 / 3 in decimal
// console.log(0.1 + 0.3);
// console.log(0.1 + 0.2 === 0.3);

// 1. Conversion
// Trick to convert string to number:
// console.log(+'12');

// 2. Parsing
// Extract number from string. to work, string must start with a number
// console.log(Number.parseInt('30px'));

// console.log(Number.parseFloat('2.5rem'));

// 3. check if not a number
// console.log(Number.isNaN(20));
// console.log(Number.isNaN(+'20x'));

// Better way to check value is number or not.
// console.log(Number.isFinite('20'));

// console.log(Number.isInteger(23.4));
// console.log(Number.isInteger(23.0));

// -------------------------- Math and rounding --------------------------

// 1. Square Root
// console.log(Math.sqrt(25));
// console.log(25 ** (1 / 2));

// 2. cubic root
// console.log(8 ** (1 / 3));

// 3. Get max and min data
// console.log(Math.max(5, 18, 22, 12, 2));
// console.log(Math.min(5, 18, 22, 12, 2));

// 4. Calculate radius using PI
// console.log(Math.PI * Number.parseFloat('10px') ** 2);

// 5. Random
// Create random numbeer btween 0 and 1
// console.log(Math.random());

// 6. Rounsing integers (trunc , round, ceil,floor)
// console.log(Math.trunc(20.2));

// Create random number between two numbers
const randomInt = (min, max) =>
  Math.trunc(Math.random() * (max - min) + 1) + min;
// console.log(randomInt(2, 12));

// console.log(Math.round(22.8));  //23
// console.log(Math.ceil(22.8)); //23
// console.log(Math.trunc(22.8)); //22
// console.log(Math.floor(22.8)); //22

// floor and trunc are same while we using positive numbers
// But in negative numbers, floor works better
// console.log(Math.trunc(-22.8));
// console.log(Math.floor(-22.8));

// 7. Rounding decimals
// console.log((2.75).toFixed(0)); // toFixed stands for decimal numbers
// console.log((2.75).toFixed(1));
// console.log(+(2.75).toFixed(1)); // + convert string to number

// -------------------------- Remainder Operator --------------------------
// Returns remainder of divsion
// console.log(5 % 2);
// console.log(8 % 3);

const isEven = n => n % 2 === 0;
// console.log(isEven(8));
// console.log(isEven(12));
// console.log(isEven(21));

labelBalance.addEventListener('click', function () {
  [...document.querySelectorAll('.movements__row')].forEach(function (row, i) {
    // Change color of even rows
    if (i % 2 === 0) row.style.backgroundColor = '#39b385';
  });
});

// -------------------------- Numeric Separatoers --------------------------

const diameter = 287_460_000_000;
// console.log(diameter); //console just ignores "_"

const priceCents = 345_99;
// console.log(priceCents);

const transferFee = 15_00;
// console.log(transferFee);

// -------------------------- BigInt --------------------------

// 1. Largest safe int
// console.log(2 ** 53 + 1);
// console.log(Number.MAX_SAFE_INTEGER);

// 2. Just add "n" to end of int number to convert it into bigint
// console.log(829176519024563940186509138659348167509813476598);
// console.log(829176519024563940186509138659348167509813476598n);
// console.log(BigInt(829176519024563940186509138659348167509813476598n));

// 3. Operations
// console.log(10000n + 10000n);

// 4. Exceptions
// console.log(20n == 20);
// console.log(20n === 20);

// automaticly converted to string
const huge = 829176519024563940186509138659348167509813476598n;
// console.log(huge + ' is REALLY big');

// Math operations cannot used
// console.log(Math.sqrt(16n));

// 5. Divisions
// console.log(11n / 3n); // cuts off the decimal part
// console.log(11 / 3);

// -------------------------- Creating Dates --------------------------

// Create a date
const now1 = new Date();
// console.log(now1);
// console.log(new Date().getFullYear());

// parse the date using string
// console.log(new Date('Mon Apr 10 2023 20:08:29'));
// console.log(new Date('December 24, 2012'));

// using UTC timezone from db
// console.log(new Date(account1.movementsDates[0]));

// Months in js are 0 based. means november is 10
// console.log(new Date(2037, 10, 19, 15, 23, 5));

// pass 0 then get 0 milisecond after beggining time
// console.log(new Date(0));
// console.log(new Date(3 * 24 * 60 * 60 * 1000));  //Go forward 3 days

// Working with dates
const feature = new Date(2037, 10, 19, 15, 23);
// console.log(feature);
// console.log(feature.getFullYear());
// console.log(feature.getMonth()); // This one is 0 based
// console.log(feature.getDate()); // Get day
// console.log(feature.getDay()); //Get day of the week, 0 based
// console.log(feature.getHours());
// console.log(feature.getMinutes());
// console.log(feature.getSeconds());
// console.log(feature.toISOString()); //International standard

// console.log(feature.getTime()); //Generates a big number, use it in code below
// console.log(new Date(2142244380000));  // Use that number here to get full date

// Change dates
// feature.setFullYear(2077);
// console.log(feature);

// -------------------------- Operations with Dates --------------------------

// Days can converted to the number
// console.log(Number(feature));
// console.log(+feature);

// By default, resaults will shown in ms
const calcDaysPassed = (date1, date2) =>
  Math.abs(date2 - date1) / (1000 * 60 * 60 * 24);
const days1 = calcDaysPassed(new Date(2037, 3, 12), new Date(2037, 3, 24));
// console.log(days1);

// -------------------------- Internationalizing Dates (INTL) --------------------------

const now2 = new Date();
// labelDate.textContent = new Intl.DateTimeFormat('en-US').format(now2); // DD/MM/YYYY
// labelDate.textContent = new Intl.DateTimeFormat('en-GB').format(now2); //MM/DD/YYYY
// labelDate.textContent = new Intl.DateTimeFormat('ar-SY').format(now2);
// labelDate.textContent = new Intl.DateTimeFormat('fa-IR').format(now2);

// Can pass data in onject to intl methode to format output date
const options = {
  hour: 'numeric',
  minute: 'numeric',
  // day: 'numeric',
  // month: 'numeric',
  // month: 'long',
  // month: '2-digit',
  // year: 'numeric',
  // year: '2-digit',
  // weekday: 'long',
};
// labelDate.textContent = new Intl.DateTimeFormat('en-US', options).format(now2);

// Get location data from local, then pass it to intl
// const locale = navigator.language;
// console.log(locale);

// -------------------------- Timers --------------------------

// 1. setTimeout: Call function in future, runs only ince
// !!! code execution won't stop here, try this:
// pass time in ms
// setTimeout(() => console.log('Here is your pizza 🍕'), 3000);
// console.log('Waiting...');

// 1.1 pass arguments to timeout function
// setTimeout(
//   (ing1, ing2) => console.log(`Here is your pizza with ${ing1} and ${ing2} 🍕`),
//   3000,
//   'olives',
//   'spinach'
// );

// 1.3 Clear the timeout
// const ingredients = ['olives', 'spinach'];
// const pizzaTimer = setTimeout(
//   (ing1, ing2) => console.log(`Here is your pizza with ${ing1} and ${ing2} 🍕`),
//   3000,
//   ...ingredients
// );

// if (ingredients.includes('spinach')) clearTimeout(pizzaTimer);

// ------------------------

// 2. setInterval
// Call function many Times using timer
// setInterval(function () {
//   const now = new Date().getSeconds();
//   console.log(now);
// }, 1000);

// /////////////////////////////
// //////  Create Clock ////////
// /////////////////////////////

// ex 1 :
// setInterval(function () {
//   const dt = new Date();
//   console.log(`${dt.getHours()}:${dt.getMinutes()}:${dt.getSeconds()}`);
// }, 1000);

// ex 2 :
// const timeOptions = {
//   hour: 'numeric',
//   minute: 'numeric',
//   second: 'numeric',
// };

// setInterval(function () {
//   const nowDate = new Date();
//   const dt = new Intl.DateTimeFormat('en-US', timeOptions).format(nowDate);
//   console.log(dt);
// }, 1000);

// -------------------------- END --------------------------

let x = new Array(7);
console.log(x);
x.fill('s', 5);

console.log(x);
