const recipeUrl = 'recipe.json'; // Path to recipe JSON file
let recipes = [];
let commentsStore = {}; // In-memory storage for comments

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

  recipes.forEach((recipe) => {
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
  document.querySelectorAll('.view-recipe').forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const recipeId = e.target.getAttribute('href').substring(1);
      displayRecipeDetail(recipeId);
    });
  });
}

// Display detailed view of a recipe
function displayRecipeDetail(recipeId) {
  const recipe = recipes.find((r) => r.id === recipeId);
  if (!recipe) return;

  document.getElementById('recipe-list').style.display = 'none'; // Hide recipe list
  const recipeDetail = document.getElementById('recipe-detail');
  recipeDetail.style.display = 'block'; // Show recipe detail

  document.getElementById('recipeTitle').innerText = recipe.title;
  document.getElementById('recipeTitle').setAttribute('data-recipe-id', recipe.id);
  document.getElementById('recipeImage').src = recipe.image;
  document.getElementById('recipeImage').alt = recipe.title;

  // Populate ingredients
  const ingredientsList = document.getElementById('recipeIngredients');
  ingredientsList.innerHTML = '';
  recipe.ingredients.forEach((ingredient) => {
    const li = document.createElement('li');
    li.textContent = ingredient;
    ingredientsList.appendChild(li);
  });

  // Populate instructions
  const instructionsList = document.getElementById('recipeInstructions');
  instructionsList.innerHTML = '';
  recipe.instructions.forEach((instruction) => {
    const li = document.createElement('li');
    li.textContent = instruction;
    instructionsList.appendChild(li);
  });

  // Fetch and display comments for this recipe
  displayComments(recipeId);
}

// Back to recipe list view
function backToRecipeList() {
  document.getElementById('recipe-detail').style.display = 'none'; // Hide recipe detail
  document.getElementById('recipe-list').style.display = 'grid'; // Show recipe list
}

// Add a comment to the in-memory store
async function addComment(e, recipeId) {
  e.preventDefault();  // Prevent the form from reloading the page
  const name = document.getElementById('name').value;
  const commentText = document.getElementById('comment').value;

  if (!name || !commentText) {
    alert('Please enter both your name and comment.');
    return;
  }

  const newComment = { name, commentText };

  // POST the comment to the backend
  try {
    const response = await fetch(`http://localhost:5000/recipes/${recipeId}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newComment)
    });
    if (response.ok) {
      document.getElementById('commentForm').reset(); // Reset the form
      displayComments(recipeId); // Refresh the comments list
    } else {
      alert('Failed to submit comment');
    }
  } catch (error) {
    console.error('Error submitting comment:', error);
  }
}



// Display comments for the specific recipe
async function displayComments(recipeId) {
  try {
    const response = await fetch(`http://localhost:5000/recipes/${recipeId}/comments`);
    const comments = await response.json();
    const commentsSection = document.getElementById('comments');
    commentsSection.innerHTML = ''; // Clear current comments

    if (comments.length === 0) {
      commentsSection.innerHTML = '<p>No comments yet. Be the first to comment!</p>';
    } else {
      comments.forEach((comment) => {
        const commentElement = document.createElement('div');
        commentElement.classList.add('comment-item');
        commentElement.innerHTML = `
          <p class="comment-author">${comment.name} <span class="comment-date">(${new Date(comment.date).toLocaleDateString()})</span></p>
          <p>${comment.commentText}</p>
        `;
        commentsSection.appendChild(commentElement);
      });
    }
  } catch (error) {
    console.error('Error fetching comments:', error);
  }
}


// Hook up the comment form submission
document.getElementById('commentForm').addEventListener('submit', (e) => {
  const recipeId = document.getElementById('recipeTitle').getAttribute('data-recipe-id');
  addComment(e, recipeId);
});

// Initialize the page: fetch recipes and set up event listeners
window.onload = () => {
  fetchRecipes();
  document.getElementById('back-button').addEventListener('click', backToRecipeList); // Hook up the back button
};
