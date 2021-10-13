"use strict";

//Note - we use bind for eventlisteners that uses the this keyword, and for method that passes another method as a paremeter function like navigator.geolocation.getCurrentPosition(method.bind(this), function)

class Workout {
  date = new Date();
  id = (Date.now() + "").slice(-10);

  constructor(coords, distance, duration) {
    this.coords = coords; //[lat, long]
    this.distance = distance; //Km
    this.duration = duration; //Min
  }

  _setDescription() {
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

    this.description = `${this.type[0].toUpperCase()}${this.type.slice(1)} on ${
      months[this.date.getMonth()]
    } ${this.date.getDate()}`;
  }
}

class Runnning extends Workout {
  type = "running";

  constructor(coords, distance, duration, cadence) {
    super(coords, distance, duration);
    this.cadence = cadence;
    this.calcPace();
    this._setDescription();
  }

  calcPace() {
    // Min / Km
    this.pace = this.duration / this.distance;
    return this.pace;
  }
}

class Cycling extends Workout {
  type = "cycling";

  constructor(coords, distance, duration, elevationGain) {
    super(coords, distance, duration);
    this.elevationGain = elevationGain;
    this.calcSpeed();
    this._setDescription();
  }

  calcSpeed() {
    //Km / (min/60)
    this.speed = this.distance / (this.duration / 60);
    return this.speed;
  }
}

/////////////////////////////////
// APPLICATION ARCHITECTURE
const form = document.querySelector(".form");
const containerWorkouts = document.querySelector(".workouts");
const inputType = document.querySelector(".form_input-type");
const inputDistance = document.querySelector(".form_input-distance");
const inputDuration = document.querySelector(".form_input-duration");
const inputCadence = document.querySelector(".form_input-cadence");
const inputElevation = document.querySelector(".form_input-elevation");

class App {
  #map;
  #mapEvent;
  #workouts = [];

  constructor() {
    this._getPosition();
    form.addEventListener("submit", this._newWorkOut.bind(this));
    inputType.addEventListener("change", this._toggleElevationField);
  }

  _getPosition() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        this._loadMap.bind(this),
        function () {
          alert("Could not get your location");
        }
      );
    }
  }

  _loadMap(position) {
    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;

    const coords = [latitude, longitude];

    this.#map = L.map("map").setView(coords, 13);

    L.tileLayer("https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    //Handling clicks on the map
    this.#map.on("click", this._showForm.bind(this));
  }

  _showForm(mapE) {
    this.#mapEvent = mapE;
    form.classList.remove("hidden");
    inputDistance.focus();
  }

  _hideForm() {
    inputDistance.value =
      inputDuration.value =
      inputCadence.value =
      inputElevation.value =
        "";
    form.style.display = "none";
    form.classList.add("hidden");
    setTimeout(() => (form.style.display = "grid"), 1000);
  }

  _toggleElevationField() {
    inputElevation.closest(".form_row").classList.toggle("form_row-hidden");

    inputCadence.closest(".form_row").classList.toggle("form_row-hidden");
  }

  _newWorkOut(e) {
    const validInputs = (...inputs) =>
      inputs.every((inp) => Number.isFinite(inp));

    const positiveInputs = (...inputs) => inputs.every((inp) => inp > 0);

    e.preventDefault();

    //Get data from the form
    const type = inputType.value;
    const distance = +inputDistance.value;
    const duration = +inputDuration.value;
    const { lat, lng } = this.#mapEvent.latlng;
    let workout;

    //if workout running, create a running object
    if (type === "running") {
      const cadence = +inputCadence.value;

      if (
        !validInputs(distance, duration, cadence) ||
        !positiveInputs(distance, duration, cadence)
      )
        return alert("Inputs have to be positive numbers");

      workout = new Runnning([lat, lng], distance, duration, cadence);
    }

    //if cycling running, create a cycling object
    if (type === "cycling") {
      const elevation = +inputElevation.value;

      if (
        !validInputs(distance, duration, elevation) ||
        !positiveInputs(distance, duration)
      )
        return alert("Inputs have to be positive numbers");

      workout = new Cycling([lat, lng], distance, duration, elevation);
    }

    //Add new object to workout array
    this.#workouts.push(workout);

    //Render the workout on the map as marker
    this._renderWorkOutMarker(workout);

    //Render the workout on the list
    this._renderWorkout(workout);

    //Hide and clear form
    this._hideForm();
  }

  _renderWorkOutMarker(workout) {
    L.marker(workout.coords)
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 250,
          minWidth: 100,
          autoClose: false,
          closeOnClick: false,
          className: `${workout.type}-popup`,
        })
      )
      .setPopupContent(
        `${workout.type === "running" ? "🏃‍♂️" : "⚡️"} ${workout.description}`
      )
      .openPopup();
  }

  _renderWorkout(workout) {
    let html = ` 
       <li class="workout workout-${workout.type}" data-id="${workout.id}">
          <h2 class="workout_title">${workout.description}</h2>

          <div class="workout_details">
            <span class="workout_icon">${
              workout.type === "running" ? "🏃‍♂️" : "⚡️"
            }</span>
            <span class="workout_value">${workout.distance}</span>
            <span class="workout_unit">km</span>
          </div>

          <div class="workout_details">
            <span class="workout_icon">⏱</span>
            <span class="workout_value">${workout.duration}</span>
            <span class="workout_unit">min</span>
          </div>`;

    if (workout.type === "running") {
      html += ` 
          <div class="workout__details">
            <span class="workout_icon">⚡️</span>
            <span class="workout_value">${workout.pace.toFixed(1)}</span>
            <span class="workout_unit">min/km</span>
          </div>

          <div class="workout__details">
            <span class="workout_icon">🦶🏼</span>
            <span class="workout_value">${workout.cadence}</span>
            <span class="workout_unit">spm</span>
          </div>
        </li>`;
    }

    if (workout.type === "cycling") {
      html += `  
          <div class="workout__details">
            <span class="workout_icon">⚡️</span>
            <span class="workout_value">${workout.speed.toFixed(1)}</span>
            <span class="workout_unit">km/hr</span>
          </div>

          <div class="workout__details">
            <span class="workout_icon">⛰</span>
            <span class="workout_value">${workout.elevationGain}</span>
            <span class="workout_unit">m</span>
          </div>
        </li> `;
    }

    form.insertAdjacentHTML("afterend", html);
  }
}

const app = new App();
