const repoOwner = 'Feroov'; // Replace with your GitHub username
const repoName = 'FERecipe'; // Replace with your GitHub repository name
const githubApiUrl = `https://api.github.com/repos/${repoOwner}/${repoName}/issues`;
const recipeUrl = 'recipe.json'; // Path to recipe JSON file

let recipes = [];

// Fetch and display recipes
async function fetchRecipes() {
  try {
    const response = await fetch(recipeUrl);
    if (!response.ok) {
      throw new Error('Failed to load recipe data');
    }
    const data = await response.json();
    recipes = data.recipes;
    displayRecipeList();
  } catch (error) {
    console.error('Error fetching recipes:', error);
  }
}

// Display the list of recipes
function displayRecipeList() {
  const recipeList = document.getElementById('recipe-list');
  recipeList.innerHTML = '';

  recipes.forEach(recipe => {
    const recipeCard = document.createElement('article');
    recipeCard.classList.add('recipe-card');
    recipeCard.innerHTML = `
      <img src="${recipe.image}" alt="${recipe.title}" class="recipe-image">
      <div class="recipe-content">
        <h2 class="recipe-title">${recipe.title}</h2>
        <p class="recipe-description">${recipe.description}</p>
        <div class="recipe-meta">
          <span>Prep time: ${recipe.prepTime}</span>
          <span>Servings: ${recipe.servings}</span>
        </div>
        <a href="#${recipe.id}" class="view-recipe">View Recipe</a>
      </div>
    `;
    recipeList.appendChild(recipeCard);
  });

  // Add event listeners for "View Recipe" links
  document.querySelectorAll('.view-recipe').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const recipeId = e.target.getAttribute('href').substring(1);
      displayRecipeDetail(recipeId);
    });
  });
}

// Display detailed view of a recipe
function displayRecipeDetail(recipeId) {
  const recipe = recipes.find(r => r.id === recipeId);
  if (!recipe) return;

  document.getElementById('recipe-list').style.display = 'none'; // Hide recipe list
  const recipeDetail = document.getElementById('recipe-detail');
  recipeDetail.style.display = 'block'; // Show recipe detail

  document.getElementById('recipeTitle').innerText = recipe.title;
  document.getElementById('recipeImage').src = recipe.image;
  document.getElementById('recipeImage').alt = recipe.title;

  // Populate ingredients
  const ingredientsList = document.getElementById('recipeIngredients');
  ingredientsList.innerHTML = '';
  recipe.ingredients.forEach(ingredient => {
    const li = document.createElement('li');
    li.textContent = ingredient;
    ingredientsList.appendChild(li);
  });

  // Populate instructions
  const instructionsList = document.getElementById('recipeInstructions');
  instructionsList.innerHTML = '';
  recipe.instructions.forEach(instruction => {
    const li = document.createElement('li');
    li.textContent = instruction;
    instructionsList.appendChild(li);
  });

  // Fetch and display comments for this recipe
  fetchComments(recipeId);

  // Update the comment form to use the current recipe ID
  const commentForm = document.getElementById('commentForm');
  commentForm.onsubmit = (e) => redirectToGitHubIssue(e, recipeId);
}


// Back to recipe list view
function backToRecipeList() {
  document.getElementById('recipe-detail').style.display = 'none'; // Hide recipe detail
  document.getElementById('recipe-list').style.display = 'grid'; // Show recipe list
}

// Fetch and display comments for the current recipe
async function fetchComments(recipeId) {
  const commentsSection = document.getElementById('comments');
  commentsSection.innerHTML = '<p>Loading comments...</p>';

  try {
    const response = await fetch(`/api/comments?recipeId=${recipeId}`);
    if (!response.ok) {
      throw new Error('Failed to load comments');
    }

    const comments = await response.json();
    commentsSection.innerHTML = '';
    if (comments.length === 0) {
      commentsSection.innerHTML = '<p>No comments yet. Be the first to comment!</p>';
    } else {
      comments.forEach(comment => displayComment(comment, commentsSection));
    }
  } catch (error) {
    console.error('Error fetching comments:', error);
    commentsSection.innerHTML = '<p>Failed to load comments. Please try again later.</p>';
  }
}

async function addComment(event, recipeId) {
  event.preventDefault();

  const name = document.getElementById('name').value.trim();
  const comment = document.getElementById('comment').value.trim();

  if (!name || !comment) {
    alert('Please fill in both your name and comment.');
    return;
  }

  const newComment = {
    name,
    comment,
    recipeId,
  };

  try {
    const response = await fetch('/api/comments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newComment),
    });

    if (!response.ok) {
      throw new Error('Failed to add comment');
    }

    // Refresh comments after successful submission
    fetchComments(recipeId);
  } catch (error) {
    console.error('Error adding comment:', error);
  }
}


// Display individual comment
function displayComment(comment, container) {
  const commentElement = document.createElement('div');
  commentElement.classList.add('comment-item');
  commentElement.innerHTML = `
    <p class="comment-author">${sanitizeHTML(comment.user.login)}</p>
    <p class="comment-date">${new Date(comment.created_at).toLocaleDateString()}</p>
    <p>${sanitizeHTML(comment.body)}</p>
  `;
  container.appendChild(commentElement);
}

// Sanitize HTML to prevent XSS
function sanitizeHTML(str) {
  const tempDiv = document.createElement('div');
  tempDiv.textContent = str;
  return tempDiv.innerHTML;
}

// Redirect to GitHub to create a new issue (comment)
function redirectToGitHubIssue(event, recipeId) {
  event.preventDefault();

  const name = document.getElementById('name').value.trim();
  const comment = document.getElementById('comment').value.trim();
  if (!name || !comment) {
    alert('Please fill in both your name and comment.');
    return;
  }

  // Include the recipe ID in the issue title to link the comment with the recipe
  const issueTitle = encodeURIComponent(`Comment on ${recipeId} by ${name}`);
  const issueBody = encodeURIComponent(comment);
  const githubIssueUrl = `https://github.com/${repoOwner}/${repoName}/issues/new?title=${issueTitle}&body=${issueBody}`;

  window.open(githubIssueUrl, '_blank');
}


// Initialize the page: fetch recipes and set up event listeners
window.onload = () => {
  fetchRecipes();
  document.getElementById('back-button').addEventListener('click', backToRecipeList); // Hook up the back button
};
