document.getElementById('signupForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const username = document.getElementById('txtSign').value;
    const password = document.getElementById('pswdSign').value;
    const email = document.getElementById('emailSign').value;

    fetch('/registrazione', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password, email }),
    })
    .then(response => response.json())
    .then(data => {
      const signupResult = document.getElementById('signupResult');
      const message = data.message;
      if (data.error) {
        signupResult.innerHTML = `
          <div class="alert alert-danger" role="alert">
            ${message}
          </div>
        `;
      } else {
        signupResult.innerHTML = `
          <div class="alert alert-success" role="alert">
            ${message}
          </div>
        `;
      }
    })
    .catch(error => {
      console.error('Error:', error);
    });
  });

  document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const username = document.getElementById('txtLogin').value;
    const password = document.getElementById('pswdLogin').value;

    fetch('/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    })
    .then(response => response.json())
    .then(data => {
      const loginResult = document.getElementById('loginResult');
      const message = data.result ? 'Login successful' : 'Invalid username or password';
      const alertType = data.result ? 'alert-success' : 'alert-danger';
      loginResult.innerHTML = `
        <div class="alert ${alertType}" role="alert">
          ${message}
        </div>
      `;
      if (data.result) {
        let dati={user: username, log: true };
        sessionStorage.setItem("loggato", JSON.stringify(dati));
        window.location.href = "./home.html";
        username="";
        password="";
        console.log(data.userData);
      }
    })
    .catch(error => {
      console.error('Error:', error);
    });
  });