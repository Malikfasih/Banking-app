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
    // '2019-11-18T21:31:17.178Z',
    // '2019-12-23T07:42:02.383Z',
    // '2020-01-28T09:15:04.904Z',
    // '2020-04-01T10:17:24.185Z',
    // '2020-05-08T14:11:59.604Z',
    // '2020-07-09T17:01:17.194Z',
    // '2020-07-11T23:36:17.929Z',
    // '2020-07-12T10:51:36.790Z',
    '2020-11-18T21:31:17.178Z',
    '2020-12-23T07:42:02.383Z',
    '2021-01-28T09:15:04.904Z',
    '2021-04-01T10:17:24.185Z',
    '2021-05-08T14:11:59.604Z',
    '2021-07-03T17:01:17.194Z',
    '2021-07-05T23:36:17.929Z',
    '2021-07-07T10:51:36.790Z',
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
    '2020-06-24T18:49:59.371Z',
    '2020-07-26T12:01:20.894Z',
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
const formateMovementDate = function (date, locale) {
  const calcDaysPassed = (date1, date2) =>
    Math.round(Math.abs((date2 - date1) / (1000 * 60 * 60 * 24)));
  const daysPassed = calcDaysPassed(new Date(), date);
  // console.log(daysPassed);
  if (daysPassed === 0) return `Today`;
  if (daysPassed === 1) return `Yesterday`;
  if (daysPassed <= 7) return `${daysPassed} days ago`;

  // const day = `${date.getDay()}`.padStart(2, 0);
  // const month = `${date.getMonth() + 1}`.padStart(2, 0); // + 1 coz month is 0 based
  // const year = date.getFullYear();
  // return `${day} / ${month} / ${year}`;

  // Internationalizing API for formating date time etc
  return new Intl.DateTimeFormat(locale).format(date);
};

const formattedCur = function (value, locale, currency) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(value);
};

const displayMovements = function (acc, sort = false) {
  containerMovements.innerHTML = '';

  const movs = sort
    ? acc.movements.slice().sort((a, b) => a - b)
    : acc.movements;

  movs.forEach(function (mov, i) {
    const type = mov > 0 ? 'deposit' : 'withdrawal';
    const date = new Date(acc.movementsDates[i]);
    // console.log(date);
    const displayDate = formateMovementDate(date, acc.locale);

    const formattedMov = formattedCur(mov, acc.locale, acc.currency);

    const html = `
    <div class="movements__row">
    <div class="movements__type movements__type--${type}">${i + 1} ${type}</div>
    <div class="movements__date">${displayDate}</div>
    
    <div class="movements__value">${formattedMov}</div>
      </div>
    `;

    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

const calcDisplayBalance = function (acc) {
  acc.balance = acc.movements.reduce((acc, mov) => acc + mov, 0);
  // labelBalance.textContent = `${acc.balance.toFixed(2)}€`;// before Intl.formatNum
  labelBalance.textContent = formattedCur(
    acc.balance,
    acc.locale,
    acc.currency
  );
};

const calcDisplaySummary = function (acc) {
  const incomes = acc.movements
    .filter(mov => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);
  // labelSumIn.textContent = `${incomes.toFixed(2)}€`; before Intl
  labelSumIn.textContent = formattedCur(incomes, acc.locale, acc.currency);

  const out = acc.movements
    .filter(mov => mov < 0)
    .reduce((acc, mov) => acc + mov, 0);
  // labelSumOut.textContent = `${Math.abs(out).toFixed(2)}€`; before Intl
  labelSumOut.textContent = formattedCur(
    Math.abs(out),
    acc.locale,
    acc.currency
  );

  const interest = acc.movements
    .filter(mov => mov > 0)
    .map(deposit => (deposit * acc.interestRate) / 100)
    .filter((int, i, arr) => {
      // console.log(arr);
      return int >= 1;
    })
    .reduce((acc, int) => acc + int, 0);
  // labelSumInterest.textContent = `${interest.toFixed(2)}€`; before Intl
  labelSumInterest.textContent = formattedCur(
    interest,
    acc.locale,
    acc.currency
  );
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

///////////////////////////////////////
const setLogoutTimer = function () {
  const tick = function () {
    const min = String(Math.trunc(time / 60)).padStart(2, 0); // converted to string because to 'padstart'
    const sec = String(Math.trunc(time % 60)).padStart(2, 0);
    //In each call, print the remaining time to UI
    labelTimer.textContent = `${min}:${sec}`;

    //when 0 second, stop timer and logout to user
    if (time === 0) {
      clearInterval(timer);
      labelWelcome.textContent = 'Log in to get started';
      containerApp.style.opacity = 0;
    }
    //decrease 1s
    time--;
  };
  //set time 5 minutes
  let time = 120;
  //call the timer every second
  tick();
  const timer = setInterval(tick, 1000);

  return timer; // doing this to clear the precious timer which we loggined - step 1
};

// Event handlers
// commented coz chrome don't support ?.(optional chaining)
let currentAccount, timer; // doing this to clear the precious timer which we loggined - step 2
// Fake account logged in
// currentAccount = account1;
// updateUI(currentAccount);
// containerApp.style.opacity = 100;

btnLogin.addEventListener('click', function (e) {
  // Prevent form from submitting
  e.preventDefault();

  currentAccount = accounts.find(
    acc => acc.username === inputLoginUsername.value
  );
  console.log(currentAccount);

  if (currentAccount?.pin === +inputLoginPin.value) {
    // Display UI and message
    labelWelcome.textContent = `Welcome back, ${
      currentAccount.owner.split(' ')[0]
    }`;
    containerApp.style.opacity = 100;

    // Creating current date and time
    const now = new Date();
    const options = {
      hour: 'numeric',
      minute: 'numeric',
      day: 'numeric',
      // weekday: 'long', //or
      // weekday: 'short',
      month: 'numeric', //or
      // month: 'long', //or
      // month: '2-digit',
      year: 'numeric', //or
      // year: '2-digit',
    };
    // const localeNav = navigator.language; // to get the date etc from user browser
    // labelDate.textContent = new Intl.DateTimeFormat(localeNav, options).format(
    //   now
    // );

    // displaying jonas accounts date etc in Protugal and jessica in US
    labelDate.textContent = new Intl.DateTimeFormat(
      currentAccount.locale,
      options
    ).format(now);

    // const day = `${now.getDay()}`.padStart(2, 0);
    // console.log(day);
    // const month = `${now.getMonth() + 1}`.padStart(2, 0); // + 1 coz month is 0 based
    // const year = now.getFullYear();
    // const hour = `${now.getHours()}`.padStart(2, 0);
    // const min = `${now.getMinutes()}`.padStart(2, 0);
    // labelDate.textContent = `${day} / ${month} / ${year}, ${hour}:${min}`;

    // Clear input fields
    inputLoginUsername.value = inputLoginPin.value = '';
    inputLoginPin.blur();

    // Timer // doing this to clear the precious timer which we loggined - step 3
    if (timer) clearInterval(timer);
    timer = setLogoutTimer();

    // Update UI
    updateUI(currentAccount);
  }
});

// commented coz chrome don't support ?.(optional chaining)

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

    // Adding transfer date
    currentAccount.movementsDates.push(new Date().toISOString());
    receiverAcc.movementsDates.push(new Date().toISOString());

    // Update UI
    updateUI(currentAccount);

    //Rest timer
    clearInterval(timer);
    timer = setLogoutTimer();
  }
});

btnLoan.addEventListener('click', function (e) {
  e.preventDefault();

  const amount = Math.floor(inputLoanAmount.value);

  if (amount > 0 && currentAccount.movements.some(mov => mov >= amount * 0.1)) {
    setTimeout(function () {
      // Add movement
      currentAccount.movements.push(amount);

      // Add loan date
      currentAccount.movementsDates.push(new Date().toISOString());

      // Update UI
      updateUI(currentAccount);

      //Rest timer
      clearInterval(timer);
      timer = setLogoutTimer();
    }, 2500);
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

//Base 10 - 0 to 9, 1/10 = 0.1, 3/10 = 3.3333333
//binary base 2 - 0 1
/*
// Conversion
console.log(Number('22')); // or modern way
console.log(+'22');

// Parsing
console.log(Number.parseInt('23px', 10));
// console.log(+parseInt('23px'));
console.log(Number.parseInt('1.3rem', 10));

console.log(Number.parseFloat('1.3rem'));
//
console.log(Number.isNaN('20'));
console.log(Number.isNaN(20));
console.log(Number.isNaN(+'20px'));

// Checking if value is a number

console.log(Number.isFinite('20'));
console.log(Number.isFinite(20));
console.log(Number.isFinite(+'20x'));
console.log(Number.isFinite(23 / 0));

console.log(Number.isInteger(20));
console.log(Number.isInteger('20'));
console.log(Number.isInteger(20.0)); // true
console.log(Number.isInteger(20.1)); // false
console.log(Number.isInteger(20 / 0));

// to find square root of the value
console.log(Math.sqrt(25)); // 5 is a answer or other way to find
console.log(25 ** (1 / 2));
//  to find cube root of the value
console.log(8 ** (1 / 3));
//  to find max and min value
console.log(Math.max(34, 56, 78, 12));
console.log(Math.max(34, 56, '78', 12));
console.log(Math.min(34, 56, 78, 12));

// to find the radius or area of the circle

console.log(Math.PI); // it is a const value
console.log(Math.PI * Number.parseFloat('10px') ** 2);

//
console.log(Math.trunc(Math.random() * 6) + 1);

const randomInt = (min, max) =>
  Math.floor(Math.random() * (max - min) + 1) + min;
// 0...1 -> 0...(max - min) -> min...max
console.log(randomInt(10, 20));

// Rounding integers
console.log(Math.round(22.3));
console.log(Math.round(22.6)); // this will round to upper value

console.log(Math.ceil(22.3)); // this will round to upper value
console.log(Math.ceil(22.7)); // this will round to upper value

console.log(Math.floor(22.3)); //this will give the same value without decimal
console.log(Math.floor(22.7)); //this will give the same value without decimal

console.log(Math.trunc(22.3)); //this will give the same value without decimal

console.log(Math.trunc(-22.3));
console.log(Math.floor(-22.3)); //this will round off to upper value coz of negative sign

// Rounding decimals
console.log((2.7).toFixed(0)); //toFixed gives a string
console.log((2.7).toFixed(3));
console.log((2.745).toFixed(2));
console.log(+(2.745).toFixed(2)); //converting into a number

// to check even or odd Number
console.log(5 % 2); //remainder will be 1
console.log(4 % 2); //remainder will be 0

const isEven = n => n % 2 === 0;
console.log(isEven(3));
console.log(isEven(8));
console.log(isEven(5));

// practising of real example with movements by changing the color of every 2nd row

labelBalance.addEventListener('click', function () {
  [...document.querySelectorAll('.movements__row')].forEach(function (row, i) {
    // 0,2,4,6...
    if (i % 2 === 0) row.style.background = 'orangered';
    // 0,3,6,9...
    if (i % 3 === 0) row.style.background = 'yellowgreen';
  });
});

// BigInt (this is used to store a large number as much as we can)

console.log(2 ** 53 - 1); // 9007199254740991 this is the last large num which jS can store
console.log(Number.MAX_SAFE_INTEGER); // 9007199254740991 this will give the same max number to store
// but

console.log(35362748292972229374644826383); // this will not log the whole result
console.log(35362748292972229374644826383n); //this will log the result with the help of 'n'
// or BigInt
console.log(BigInt(35362748292972229374644826383));

// operations
console.log(10000n + 10000n);
console.log(293840304833884932030n * 1000000n);

// Exception
console.log(20n > 10); // true
console.log(20n === 20); // false
console.log(20n == 20); // true because of type coercion

// Division
console.log(10n / 3n); //'3' as it converts the decimal part
console.log(10 / 3); //'3.333'

/*
// Create a date
// 1).
const now = new Date();
console.log(now);

console.log(new Date('November 8,2015'));
console.log(new Date(account1.movementsDates[0]));
console.log(new Date(2037, 10, 8, 10, 30, 22));

console.log(new Date(0)); // initial Unix time
// and to find 3 days after unix time
console.log(new Date(3 * 24 * 60 * 60 * 1000)); // this is how we covert days from miliseconds
// days * 1day hours * 60 min * 60 sec * 1sec/1000 milisec
*/
// working with dates
/*
const future = new Date(2037, 10, 9, 10, 30, 22);
console.log(future);
console.log(future.getFullYear());
console.log(future.getMonth());
console.log(future.getDate());
console.log(future.getDay());
console.log(future.getHours());
console.log(future.getMinutes());
console.log(future.getSeconds());
console.log(future.getMilliseconds());
console.log(future.toISOString());
console.log(future.getTime()); // gives the time stamp
console.log(new Date(2141357422000));

console.log(Date.now()); //this will give current time stamp and we can find below
console.log(new Date(1625547702028));

// there is also a 'set method' for these above methods
// e.g for year
future.setFullYear(2040);
console.log(future);
*/

// Opertaions with dates

// const future = new Date(2037, 10, 9, 10, 30, 22);
// console.log(future);
// console.log(+future);

// const calcDaysPassed = (date1, date2) =>
//   (date2 - date1) / (1000 * 60 * 60 * 24);

// const days1 = calcDaysPassed(new Date(2037, 10, 4), new Date(2037, 10, 24));
// console.log(days1);

// Intl Number
// const num = 345266.23;
// const options = {
//   style: 'unit',
//   unit: 'celsius',
//   // style: 'currency',
//   // currency: 'EUR',
//   // useGrouping: false, // it will display number without separation by comma
// };
// console.log('US:  ', new Intl.NumberFormat('en-US', options).format(num));
// console.log('Germany:   ', new Intl.NumberFormat('de-De', options).format(num));
// console.log('Syria:  ', new Intl.NumberFormat('ar-SY', options).format(num));
// console.log(
//   navigator.language,
//   new Intl.NumberFormat(navigator.language, options).format(num)
// );

// setTimeout
const ingredients = ['olives', 'spinach'];
const pizzaTime = setTimeout(
  (ing1, ing2) => console.log(`here is your pizza with ${ing1} and ${ing2}`),
  3000,
  ...ingredients
);
if (ingredients.includes('olives')) clearTimeout(pizzaTime); // now this will not display

//setinterval
// setInterval(() => {
//   const now = new Date();
//   console.log(now);
// }, 2500);

// practicing to make a clock

// const timer = setTimeout(() => {
//   const date = new Date();
//   const hour = setinterval(() => {
//     date.getHours();
//   }, 3600000);
//   const minute = setinterval(() => {
//     date.getMinutes();
//   }, 60000);
//   const second = setinterval(() => {
//     date.getSeconds();
//   }, 1000);
//   console.log(`${hour}:${minute}:${second}`);
// }, 1000);
// console.log(timer);
