const pswdSign=document.getElementById("pswdSign");
const emailSign=document.getElementById("emailSign");
const userSign=document.getElementById("txtSign");
const signBtn=document.getElementById("signBtn");
const pswdLogin=document.getElementById("pswdLogin");
const userLogin=document.getElementById("txtLogin");
const loginBtn=document.getElementById("loginBtn");

function Registrazione(username, pass, email) {
    return new Promise((resolve, reject) => {
      fetch("/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username,
          password: pass,
          email: email
        }),
      })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Errore durante la richiesta di registrazione");
        }
        return response.json();
      })
      .then((json) => {
        alert("Registrazione eseguita");
        resolve(json);
      })
      .catch((error) => {
        console.error('Error:', error);
        alert('Error registering user: ' + error.message);
        reject(error);
      });
    });
  }
  

  signBtn.onclick = () => {
    const username = userSign.value;
    const password = pswdSign.value;
    const email = emailSign.value;
    
    if (username && password && email) {
      Registrazione(username, password, email)
        .then(() => {
         alert("registrazione fatta");
        })
        .catch((error) => {
          alert("errore nella registrazione")
        });
    } else {
      alert("Compila tutti i campi del modulo di registrazione.");
    }
  }
  
