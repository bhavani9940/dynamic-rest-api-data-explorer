// ============================================================
// Dynamic JavaScript DOM Logic & RESTful API Client
// ES6+ | Async/Await | Fetch API | DOM | Client State
// ============================================================

const API_URL = "https://jsonplaceholder.typicode.com/posts";

// Client-side application state
const state = {
    posts: [],
    filteredPosts: [],
    searchTerm: "",
    userId: "all",
    loading: false,
    error: null
};

// DOM elements
const searchInput = document.getElementById("searchInput");
const userFilter = document.getElementById("userFilter");
const refreshButton = document.getElementById("refreshButton");
const postContainer = document.getElementById("postContainer");

const loadingMessage = document.getElementById("loadingMessage");
const errorMessage = document.getElementById("errorMessage");

const totalCount = document.getElementById("totalCount");
const visibleCount = document.getElementById("visibleCount");
const resultText = document.getElementById("resultText");


// ------------------------------------------------------------
// Fetch data from REST API using async/await
// ------------------------------------------------------------

async function fetchPosts() {

    setLoading(true);
    clearError();

    try {

        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error("API request failed");
        }

        const data = await response.json();

        // Store API data in client state
        state.posts = data;

        populateUserFilter(data);

        applyFilters();

    } catch (error) {

        state.error = error.message;

        errorMessage.textContent =
            "Unable to load data. Please try again.";

        errorMessage.hidden = false;

    } finally {

        setLoading(false);
    }
}


// ------------------------------------------------------------
// Create filter options dynamically
// ------------------------------------------------------------

function populateUserFilter(posts) {

    const users = [...new Set(posts.map(post => post.userId))];

    userFilter.innerHTML =
        '<option value="all">All Users</option>';

    users.forEach(userId => {

        const option = document.createElement("option");

        option.value = userId;
        option.textContent = `User ${userId}`;

        userFilter.appendChild(option);
    });
}


// ------------------------------------------------------------
// Dynamic filtering
// ------------------------------------------------------------

function applyFilters() {

    const search =
        state.searchTerm.toLowerCase().trim();

    state.filteredPosts = state.posts.filter(post => {

        const matchesSearch =
            post.title.toLowerCase().includes(search) ||
            post.body.toLowerCase().includes(search);

        const matchesUser =
            state.userId === "all" ||
            String(post.userId) === String(state.userId);

        return matchesSearch && matchesUser;
    });

    renderPosts();
    updateStatistics();
}


// ------------------------------------------------------------
// Render data dynamically into DOM
// ------------------------------------------------------------

function renderPosts() {

    postContainer.innerHTML = "";

    if (state.filteredPosts.length === 0) {

        const message = document.createElement("div");

        message.className = "post-card";

        message.textContent = "No matching posts found.";

        postContainer.appendChild(message);

        return;
    }

    const fragment = document.createDocumentFragment();

    state.filteredPosts.forEach(post => {

        const article = document.createElement("article");

        article.className = "post-card";

        article.innerHTML = `
            <small>POST #${post.id}</small>
            <h3>${escapeHTML(post.title)}</h3>
            <p>${escapeHTML(post.body)}</p>
            <span class="user">User ${post.userId}</span>
        `;

        fragment.appendChild(article);
    });

    postContainer.appendChild(fragment);
}


// ------------------------------------------------------------
// Update client statistics
// ------------------------------------------------------------

function updateStatistics() {

    totalCount.textContent =
        state.posts.length;

    visibleCount.textContent =
        state.filteredPosts.length;

    resultText.textContent =
        `${state.filteredPosts.length} result(s)`;
}


// ------------------------------------------------------------
// Loading state
// ------------------------------------------------------------

function setLoading(value) {

    state.loading = value;

    loadingMessage.hidden = !value;

    refreshButton.disabled = value;

    refreshButton.textContent =
        value ? "Loading..." : "Refresh Data";
}


// ------------------------------------------------------------
// Error handling
// ------------------------------------------------------------

function clearError() {

    state.error = null;

    errorMessage.hidden = true;

    errorMessage.textContent = "";
}


// ------------------------------------------------------------
// Basic HTML escaping for API content
// ------------------------------------------------------------

function escapeHTML(value) {

    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


// ------------------------------------------------------------
// Event listeners
// ------------------------------------------------------------

searchInput.addEventListener("input", event => {

    state.searchTerm = event.target.value;

    applyFilters();
});


userFilter.addEventListener("change", event => {

    state.userId = event.target.value;

    applyFilters();
});


refreshButton.addEventListener("click", fetchPosts);


// ------------------------------------------------------------
// Initial API call
// ------------------------------------------------------------

fetchPosts();
