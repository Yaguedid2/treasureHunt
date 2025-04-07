fetch('/getPlayer')
  .then(res => res.json())
  .then(data => {
    console.log(data);
    const authArea = document.getElementById('authArea');
    authArea.innerHTML = ''; // Clear any existing content

    if (data.loggedIn && data.player) {
      // Logged in user
      const nameTag = document.createElement('p');
      nameTag.className = 'mb-0 me-3 fw-semibold';
      nameTag.textContent = `Hi, ${data.player}`;

      const logoutBtn = document.createElement('button');
      logoutBtn.className = 'btn btn-outline-danger';
      logoutBtn.textContent = 'Logout';
      logoutBtn.onclick = () => {
        fetch('/logoutPlayer')
          .then(() => {
            window.location.reload(); // Reload the page after logging out
          });
      };

      authArea.appendChild(nameTag);
      authArea.appendChild(logoutBtn);
    } else {
      // Not logged in
      const signInBtn = document.createElement('a');
      signInBtn.className = 'btn btn-outline-primary me-2';
      signInBtn.href = '/loginPlayer';
      signInBtn.textContent = 'Sign In';

      const signupText = document.createElement('p');
      signupText.className = 'mb-0';
      signupText.innerHTML = `Don't have an account? <a href="/signup">Sign Up</a>`;

      authArea.appendChild(signInBtn);
      authArea.appendChild(signupText);
    }
  });
