"use strict";

//Selectors
const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const form = document.querySelector(".form");
const containerWorkouts = document.querySelector(".workouts");
const inputType = document.querySelector(".form_input-type");
const inputDistance = document.querySelector(".form_input-distance");
const inputDuration = document.querySelector(".form_input-duration");
const inputCadence = document.querySelector(".form_input-cadence");
const inputElevation = document.querySelector(".form_input-elevation");

//On load
//Getting current Location
if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(
    function (position) {
      const longitude = position.coords.longitude;
      const latitude = position.coords.latitude;
      console.log(`https://www.google.ng/maps/@${latitude},${longitude}`);
    },
    function () {
      alert("Could not get your location");
    }
  );
}
