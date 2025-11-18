const apiKey = "079f756f659bf818b991bd98d5cbecaf"; 
const backgrounds = {
  clear: "images/clear.jpg",
  clouds: "images/cloud.jpg",
  rain: "images/rain.jpg",
  snow: "images/snow.jpg",
  thunder: "images/thunder.jpg",
  mist: "images/mist.jpg",
  default: "images/default.jpg"
};


// ------------------- DOM -------------------
const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");
const resultBox = document.getElementById("result");
const errorBox = document.getElementById("error");

const cityNameEl = document.getElementById("cityName");
const descEl = document.getElementById("desc");
const tempEl = document.getElementById("temp");
const humidityEl = document.getElementById("humidity");
const windEl = document.getElementById("wind");
const iconEl = document.getElementById("icon");

// event listeners
searchBtn.addEventListener("click", getWeather);
cityInput.addEventListener("keyup", (e) => { if (e.key === "Enter") getWeather(); });

// ------------------- FUNCTIONS -------------------
async function getWeather() {
  const city = cityInput.value.trim();
  if (!city) return showError("Please enter a city name.");

  // show loading state
  showError(""); // clear
  showResult(false);
  cityNameEl.textContent = "Loading...";
  descEl.textContent = "";
  tempEl.textContent = "--°C";
  humidityEl.textContent = "--%";
  windEl.textContent = "-- m/s";
  iconEl.innerHTML = "";

  const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`;

  try {
    const res = await fetch(url);
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return showError(err.message || "City not found or API error.");
    }
    const data = await res.json();
    renderWeather(data);
  } catch (err) {
    console.error(err);
    showError("Network error. Check your connection.");
  }
}

function renderWeather(data) {
  if (!data || !data.weather) return showError("No weather data received.");
  const w = data.weather[0].main.toLowerCase();
  const desc = data.weather[0].description || data.weather[0].main;

  cityNameEl.textContent = `${data.name}, ${data.sys && data.sys.country ? data.sys.country : ""}`;
  descEl.textContent = capitalize(desc);
  tempEl.textContent = `${Math.round(data.main.temp)}°C`;
  humidityEl.textContent = `${data.main.humidity}%`;
  windEl.textContent = `${data.wind.speed} m/s`;

  // set animated icon
  setIcon(w);


  setBackground(w);

  showResult(true);
}


function showResult(visible) {
  if (visible) {
    resultBox.classList.remove("hidden");
    errorBox.classList.add("hidden");
  } else {
    resultBox.classList.add("hidden");
  }
}


function showError(msg) {
  if (!msg) {
    errorBox.classList.add("hidden");
    errorBox.textContent = "";
    return;
  }
  errorBox.classList.remove("hidden");
  errorBox.classList.add("error");
  errorBox.textContent = msg;
}


function setIcon(condition) {
  iconEl.innerHTML = ""; // clear

  if (condition.includes("clear")) {
    const sun = document.createElement("div");
    sun.className = "sun";
    const rays = document.createElement("div");
    rays.className = "rays";
  
    for (let i = 0; i < 8; i++) {
      const s = document.createElement("span");
      s.style.transform = `translate(-50%,-50%) rotate(${i * 45}deg) translateY(-62px)`;
      rays.appendChild(s);
    }
    sun.appendChild(rays);
    iconEl.appendChild(sun);
  } else if (condition.includes("cloud")) {
    const wrap = document.createElement("div");
    wrap.className = "cloud-wrap";
    const cloud = document.createElement("div");
    cloud.className = "cloud";
    wrap.appendChild(cloud);
    iconEl.appendChild(wrap);
  } else if (condition.includes("rain") || condition.includes("drizzle")) {
    const wrap = document.createElement("div");
    wrap.className = "cloud-wrap";
    const cloud = document.createElement("div");
    cloud.className = "cloud";
    const rain = document.createElement("div");
    rain.className = "rain";
    for (let i = 0; i < 3; i++) {
      const d = document.createElement("div");
      d.className = "drop";
      rain.appendChild(d);
    }
    wrap.appendChild(cloud);
    wrap.appendChild(rain);
    iconEl.appendChild(wrap);
  } else if (condition.includes("snow")) {
    const wrap = document.createElement("div");
    wrap.className = "cloud-wrap";
    const cloud = document.createElement("div");
    cloud.className = "cloud";
    const snow = document.createElement("div");
    snow.className = "snow";
    for (let i = 0; i < 3; i++) {
      const f = document.createElement("div");
      f.className = "flake";
      snow.appendChild(f);
    }
    wrap.appendChild(cloud);
    wrap.appendChild(snow);
    iconEl.appendChild(wrap);
  } else if (condition.includes("thunder") || condition.includes("storm")) {
    const thunder = document.createElement("div");
    thunder.className = "thunder";
    const cloud = document.createElement("div");
    cloud.className = "cloud";
    const bolt = document.createElement("div");
    bolt.className = "bolt";
    thunder.appendChild(cloud);
    thunder.appendChild(bolt);
    iconEl.appendChild(thunder);
  } else {
    // fog / mist / default: small cloud
    const wrap = document.createElement("div");
    wrap.className = "cloud-wrap";
    const cloud = document.createElement("div");
    cloud.className = "cloud";
    wrap.appendChild(cloud);
    iconEl.appendChild(wrap);
  }
}

function setBackground(condition) {
  const body = document.body;
  let key = "default";
  if (condition.includes("clear")) key = "clear";
  else if (condition.includes("cloud")) key = "clouds";
  else if (condition.includes("rain") || condition.includes("drizzle")) key = "rain";
  else if (condition.includes("snow")) key = "snow";
  else if (condition.includes("thunder") || condition.includes("storm")) key = "thunder";
  else if (condition.includes("mist") || condition.includes("fog") || condition.includes("haze")) key = "mist";

  const img = backgrounds[key] || backgrounds.default;

  const pre = new Image();
  pre.onload = () => {
    body.style.backgroundImage = `url('${img}')`;
    body.style.backgroundSize = "cover";
    body.style.backgroundPosition = "center";
  };
  pre.onerror = () => {
    if (key === "clear") body.style.background = "linear-gradient(135deg,#f6d365 0%, #fda085 100%)";
    else if (key === "clouds") body.style.background = "linear-gradient(135deg,#2b5876 0%, #4e4376 100%)";
    else if (key === "rain") body.style.background = "linear-gradient(135deg,#3a7bd5 0%, #3a6073 100%)";
    else if (key === "snow") body.style.background = "linear-gradient(135deg,#83a4d4 0%, #b6fbff 100%)";
    else if (key === "thunder") body.style.background = "linear-gradient(135deg,#3e5151 0%, #decba4 100%)";
    else body.style.background = "linear-gradient(135deg,#1f4037 0%, #99f2c8 100%)";
    body.style.backgroundImage = "";
  };
  pre.src = img;
}

function capitalize(s){ return s.charAt(0).toUpperCase() + s.slice(1) }
