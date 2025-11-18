const BASE_URL =
  import.meta.env.VITE_API_URL ||
  (window.location.hostname === "localhost"
    ? "http://localhost:5000"
    : "https://your-render-backend-url.onrender.com");  // change if hosted online
  // const BASE_URL = import.meta.env.VITE_API_URL || "";

// ---- Auth ----
export const login = async (username, password) => {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  return res.json();
};

// ---- Child ----
export const createChild = async (childData) => {
  const res = await fetch(`${BASE_URL}/parent/create-child`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(childData),
  });
  return res.json();
};

// Results: get (normalizer)
export const getChildren = async (parentId) => {
  const res = await fetch(`${BASE_URL}/parent/children/${parentId}`);
  if (!res.ok) throw new Error("Failed to fetch children");
  return res.json();
};


// ---- Questions ----
export const getQuestions = async (exam, subject) => {
  const res = await fetch(`${BASE_URL}/questions?exam=${exam}&subject=${subject}`);
  return res.json();
};

// ---- Results ----
export const submitResults = async (resultsArray) => {
  const res = await fetch(`${BASE_URL}/test/submit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(resultsArray),
  });
  return res.json();
};


// robust getResults: server sometimes returns { results: [...] } or [...]
export const getResults = async (childId) => {
  const res = await fetch(`${BASE_URL}/test/results/${childId}`);
  if (!res.ok) {
    // try to parse any message body for debugging
    const text = await res.text();
    throw new Error(`Failed to fetch results: ${res.status} ${text}`);
  }
  const data = await res.json();
  // support both shapes:
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.results)) return data.results;
  // defensive fallback
  return [];
};

// ---- Auth ----
export const logout = async (username) => {
  // Optional: notify backend to log out if needed
  await fetch(`${BASE_URL}/auth/logout`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username }),
  }).catch(() => {}); // ignore errors if backend doesn't have logout

  // Remove user from localStorage
  localStorage.removeItem("user");
};


