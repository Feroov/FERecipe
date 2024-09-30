async function fetchComments() {
    const repoOwner = 'Feroov'; // Replace with your GitHub username
    const repoName = 'FERecipe'; // Replace with your GitHub repository name
  
    const url = `https://api.github.com/repos/${repoOwner}/${repoName}/issues`;
  
    try {
      const response = await fetch(url);
      const issues = await response.json();
  
      // Filter out any pull requests (we only want actual issues)
      const comments = issues.filter(issue => !issue.pull_request);
  
      // Display the comments in the HTML
      const commentsSection = document.getElementById('comments');
      commentsSection.innerHTML = '';
  
      if (comments.length === 0) {
        commentsSection.innerHTML = '<p>No comments yet. Be the first to comment!</p>';
      } else {
        comments.forEach((comment) => {
          const commentElement = document.createElement('div');
          commentElement.classList.add('comment-item');
          commentElement.innerHTML = `
            <h4>${comment.title}</h4>
            <p>${comment.body}</p>
          `;
          commentsSection.appendChild(commentElement);
        });
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
      document.getElementById('comments').innerHTML =
        '<p>Failed to load comments. Please try again later.</p>';
    }
  }
  
  // Fetch comments when the page loads
  window.onload = fetchComments;
  