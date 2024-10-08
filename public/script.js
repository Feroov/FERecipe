let recipes = [];

const apiBaseUrl = "https://ferecipe.onrender.com"; // Render backend URL

// Fetch and display recipes from recipe.json served by the backend
async function fetchRecipes() {
  try {
    const response = await fetch(`${apiBaseUrl}/recipes`);
    if (!response.ok) {
      throw new Error('Failed to load recipe data');
    }

    const data = await response.json(); // Get the full response
    console.log('Recipes data:', data); // Log the full response

    // Check if the "recipes" key exists and is an array
    if (Array.isArray(data.recipes)) {
      recipes = data.recipes; // Assign the recipes array to the global recipes variable
      displayRecipeList(recipes); // Display the fetched recipes on the page
    } else {
      console.error('Unexpected data format:', data);
    }
  } catch (error) {
    console.error('Error fetching recipes:', error);
  }
}

// Display the list of recipes
function displayRecipeList(recipesToDisplay) {
  const recipeList = document.getElementById('recipe-list');
  recipeList.innerHTML = '';

  recipesToDisplay.forEach((recipe) => {
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

// Filter recipes based on search query
function filterRecipes(query) {
  const filteredRecipes = recipes.filter((recipe) =>
    recipe.title.toLowerCase().includes(query.toLowerCase())
  );
  displayRecipeList(filteredRecipes); // Update the recipe list with filtered results
}

// Display detailed view of a recipe
function displayRecipeDetail(recipeId) {
  const recipe = recipes.find((r) => r.id === recipeId);
  if (!recipe) return;

  // Hide the search bar when viewing a recipe
  document.getElementById('searchInput').style.display = 'none';

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

  // Scroll to the top of the page
  window.scrollTo(0, 0);
}

// Fetch comments for a recipe
async function fetchComments(recipeId) {
  try {
    const response = await fetch(`${apiBaseUrl}/recipes/${recipeId}/comments`);
    if (!response.ok) {
      throw new Error('Failed to load comments');
    }
    const data = await response.json();
    console.log(data);
  } catch (error) {
    console.error('Error fetching comments:', error);
  }
}

// Post a comment for a recipe
async function postComment(recipeId, commentData) {
  try {
    const response = await fetch(`${apiBaseUrl}/recipes/${recipeId}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(commentData),
    });
    if (response.ok) {
      console.log('Comment posted successfully');
      fetchComments(recipeId); // Refresh the comments after posting
    } else {
      console.error('Failed to post comment');
    }
  } catch (error) {
    console.error('Error posting comment:', error);
  }
}

// Display comments for the specific recipe
async function displayComments(recipeId) {
  try {
    const response = await fetch(`${apiBaseUrl}/recipes/${recipeId}/comments`);
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
  e.preventDefault(); // Prevent form submission refresh
  const recipeId = document.getElementById('recipeTitle').getAttribute('data-recipe-id');
  const name = document.getElementById('name').value;
  const commentText = document.getElementById('comment').value;

  const commentData = { name, commentText };
  postComment(recipeId, commentData);
});

// Hook up the search input listener
document.getElementById('searchInput').addEventListener('input', (e) => {
  filterRecipes(e.target.value); // Filter recipes as user types
});

// Initialize the page: fetch recipes and set up event listeners
window.onload = () => {
  fetchRecipes();
  document.getElementById('back-button').addEventListener('click', backToRecipeList); // Hook up the back button
};

// Go back to the recipe list view
function backToRecipeList() {
  // Show the search bar when going back to the recipe list
  document.getElementById('searchInput').style.display = 'block';

  document.getElementById('recipe-detail').style.display = 'none';
  document.getElementById('recipe-list').style.display = 'grid';
}
