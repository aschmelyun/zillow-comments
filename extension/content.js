const API_BASE = "http://localhost:8000/api";

// Navigation detection variables
let currentUrl = window.location.href;
let navigationObserver = null;

// Auth token management
function getAuthToken() {
  return localStorage.getItem("zillow_comments_token");
}

function setAuthToken(token) {
  localStorage.setItem("zillow_comments_token", token);
}

function removeAuthToken() {
  localStorage.removeItem("zillow_comments_token");
}

function getListingId() {
  const url = window.location.href;
  const match = url.match(/\/homedetails\/[^\/]+\/(\d+)_zpid/);
  return match ? match[1] : null;
}

async function fetchComments(listingId) {
  try {
    const response = await fetch(`${API_BASE}/comments?id=${listingId}`);
    if (!response.ok) return [];
    return await response.json();
  } catch (error) {
    console.error("Error fetching comments:", error);
    return [];
  }
}

async function postComment(zillowListingId, body) {
  try {
    const token = getAuthToken();
    const headers = {
      "Content-Type": "application/json",
    };

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}/comments`, {
      method: "POST",
      headers: headers,
      body: JSON.stringify({
        user_id: 1,
        zillow_id: zillowListingId,
        body: body,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      return { success: false, errors: result.errors || result.message };
    }

    return { success: true, comment: result };
  } catch (error) {
    console.error("Error posting comment:", error);
    return {
      success: false,
      errors: { general: ["Network error. Please try again."] },
    };
  }
}

function createTokenInput() {
  return `
    <div class="token-input-section">
      <p>To post comments, please enter your authentication token:</p>
      <div class="token-input-form">
        <input type="text" id="token-input" placeholder="Paste your token here..." />
        <button id="save-token" class="comments-button">Save Token</button>
      </div>
      <p class="token-help">
        <a href="${API_BASE.replace("/api", "")}/login" target="_blank">Get your token here</a>
      </p>
    </div>
  `;
}

function createCommentSection() {
  const section = document.createElement("div");
  section.id = "zillow-comments-section";
  const token = getAuthToken();

  const formSection = token
    ? `
    <div class="comments-form">
      <div id="error-messages" class="error-messages" style="display: none;"></div>
      <textarea id="comment-input" placeholder="Share your thoughts about this property..."></textarea>
      <button id="submit-comment" class="comments-button">Post Comment</button>
    </div>
  `
    : createTokenInput();

  section.innerHTML = `
    <div class="comments-wrapper">
      <div>
        <div class="sep" role="separator"></div>
        <h2 class="comments-title">Comments</h2>
        <div class="comments-content">
          ${formSection}
          <div id="comments-list">
            <div class="loading">Loading comments...</div>
          </div>
        </div>
      </div>
    </div>
  `;
  return section;
}

function displayErrors(errors) {
  const errorContainer = document.getElementById("error-messages");

  if (!errors) {
    errorContainer.style.display = "none";
    return;
  }

  let errorHtml = "";

  if (typeof errors === "string") {
    errorHtml = `<div class="error-item">${errors}</div>`;
  } else if (typeof errors === "object") {
    Object.keys(errors).forEach((field) => {
      const fieldErrors = Array.isArray(errors[field])
        ? errors[field]
        : [errors[field]];
      fieldErrors.forEach((error) => {
        errorHtml += `<div class="error-item">${error}</div>`;
      });
    });
  }

  errorContainer.innerHTML = errorHtml;
  errorContainer.style.display = errorHtml ? "block" : "none";
}

function clearErrors() {
  const errorContainer = document.getElementById("error-messages");
  errorContainer.style.display = "none";
}

function renderComments(comments) {
  const commentsList = document.getElementById("comments-list");
  if (!comments.length) {
    commentsList.innerHTML =
      '<div class="no-comments">No comments yet. Be the first to comment!</div>';
    return;
  }

  commentsList.innerHTML = comments
    .map(
      (comment) => `
    <div class="comment">
      <div class="comment-header">
        <span class="comment-author">${comment.user?.name || "Anonymous"}</span>
        <span class="comment-time">${comment.time_since}</span>
      </div>
      <div class="comment-text">${comment.body}</div>
    </div>
  `,
    )
    .join("");
}

async function loadComments() {
  const zillowListingId = getListingId();
  if (!zillowListingId) return;

  const comments = await fetchComments(zillowListingId);
  renderComments(comments);
}

function refreshCommentSection() {
  const existingSection = document.getElementById("zillow-comments-section");
  if (existingSection) {
    existingSection.remove();
  }
  insertCommentSection();
}

// Navigation detection functions
function isHomeDetailsPage(url) {
  return url.includes("/homedetails/");
}

function handleNavigation() {
  const newUrl = window.location.href;

  if (newUrl !== currentUrl) {
    console.log("Navigation detected:", currentUrl, "->", newUrl);
    currentUrl = newUrl;

    if (isHomeDetailsPage(newUrl)) {
      console.log("Home details page detected, refreshing comments");
      // Wait a bit for the page to render
      setTimeout(refreshCommentSection, 3000);
    } else {
      // Remove comments section if not on home details page
      const existingSection = document.getElementById(
        "zillow-comments-section",
      );
      if (existingSection) {
        existingSection.remove();
      }
    }
  }
}

function setupNavigationDetection() {
  // Method 1: Override pushState and replaceState
  const originalPushState = history.pushState;
  const originalReplaceState = history.replaceState;

  history.pushState = function (...args) {
    originalPushState.apply(this, args);
    setTimeout(handleNavigation, 100);
  };

  history.replaceState = function (...args) {
    originalReplaceState.apply(this, args);
    setTimeout(handleNavigation, 100);
  };

  // Method 2: Listen for popstate events (back/forward buttons)
  window.addEventListener("popstate", () => {
    setTimeout(handleNavigation, 100);
  });

  // Method 3: Periodically check URL (fallback)
  setInterval(handleNavigation, 1000);

  // Method 4: MutationObserver for DOM changes that might indicate navigation
  if (navigationObserver) {
    navigationObserver.disconnect();
  }

  navigationObserver = new MutationObserver((mutations) => {
    // Check if the URL has changed after DOM mutations
    setTimeout(handleNavigation, 100);
  });

  navigationObserver.observe(document.body, {
    childList: true,
    subtree: true,
  });
}

function setupEventListeners() {
  const submitButton = document.getElementById("submit-comment");
  const commentInput = document.getElementById("comment-input");
  const saveTokenButton = document.getElementById("save-token");
  const tokenInput = document.getElementById("token-input");

  // Handle token saving
  if (saveTokenButton && tokenInput) {
    saveTokenButton.addEventListener("click", () => {
      const token = tokenInput.value.trim();
      if (!token) {
        alert("Please enter a valid token");
        return;
      }

      setAuthToken(token);
      refreshCommentSection();
    });

    tokenInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        saveTokenButton.click();
      }
    });
  }

  // Handle comment submission
  if (submitButton && commentInput) {
    submitButton.addEventListener("click", async () => {
      const body = commentInput.value.trim();
      if (!body) {
        displayErrors({ content: ["Please enter a comment"] });
        return;
      }

      clearErrors();

      submitButton.disabled = true;
      submitButton.textContent = "Posting...";

      const zillowListingId = getListingId();
      const result = await postComment(zillowListingId, body);

      if (result.success) {
        commentInput.value = "";
        clearErrors();
        await loadComments();
      } else {
        displayErrors(result.errors);
      }

      submitButton.disabled = false;
      submitButton.textContent = "Post Comment";
    });

    commentInput.addEventListener("input", () => {
      if (commentInput.value.trim()) {
        clearErrors();
      }
    });
  }
}

function insertCommentSection() {
  const targetElement = document.querySelector(".ds-data-view-list");

  if (!targetElement) {
    setTimeout(insertCommentSection, 3000);
    return;
  }

  if (document.getElementById("zillow-comments-section")) return;

  const section = createCommentSection();
  const referenceElement = targetElement.children[5];
  targetElement.insertBefore(section, referenceElement);

  setupEventListeners();
  loadComments();
}

// Initialize the extension
function initializeExtension() {
  setupNavigationDetection();

  if (isHomeDetailsPage(window.location.href)) {
    setTimeout(insertCommentSection, 3000);
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initializeExtension);
} else {
  initializeExtension();
}
