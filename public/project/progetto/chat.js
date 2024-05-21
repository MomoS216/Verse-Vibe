// Controlla se l'utente è loggato e se c'è un progetto selezionato
if (!sessionStorage.getItem("idProgetto") || !sessionStorage.getItem('loggato')) { 
  window.location.href = '../home/home.html';
}

// Ottieni ID del progetto e informazioni sull'utente dalla sessione
const idProgetto = sessionStorage.getItem("idProgetto");
const usernameSession = JSON.parse(sessionStorage.getItem('loggato'));

// Inizializza socket.io
const socket = io(); 

// Ottieni riferimenti agli elementi DOM
const form = document.getElementById("form");
const input = document.getElementById("input");
const messages = document.getElementById("messages");
const myModal = new bootstrap.Modal("#modalAccedi");

// Variabili per la stanza e l'username
let room = "";
let username = "";

// Funzione per recuperare l'ID della chat
function selectIdChat(idProgetto) {
  return new Promise((resolve, reject) => {
      fetch('/provaIdChat', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({ idProgetto: idProgetto })
      })
      .then(response => {
          if (!response.ok) {
              throw new Error('Errore durante la richiesta: ' + response.status);
          }
          return response.json();
      })
      .then(data => {
          resolve(data.chatId);
      })
      .catch(error => {
          reject(error);
      });
  });
}

// Funzione per creare una nuova chat
function insertNewChat(idProgetto) {
  return new Promise((resolve, reject) => {
      fetch('/newChat', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({ idProgetto: idProgetto })
      })
      .then(response => {
          if (!response.ok) {
              throw new Error('Errore durante la richiesta: ' + response.status);
          }
          return response.json();
      })
      .then(data => {
          resolve(data.chatId);
      })
      .catch(error => {
          reject(error);
      });
  });
}

// Funzione per recuperare i messaggi della chat per un progetto
const fetchMessagesByProjectId = (idProgetto1) => {
  return new Promise((resolve, reject) => {
      fetch('/chat', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({ idProgetto: idProgetto1 })
      })
      .then(response => {
          if (!response.ok) {
              throw new Error('Errore durante il recupero dei messaggi');
          }
          return response.json();
      })
      .then(data => {
          resolve(data.result);
      })
      .catch(error => {
          reject(error);
      });
  });
};

// Funzione per salvare un messaggio sul server
function saveMessageToServer(username, message,idchat) {
  fetch('/saveMessage', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json'
      },
      body: JSON.stringify({
          message: {
              contenuto: message,
              nomeArtista: username,
              idChat: idchat
          }
      })
  })
  .then(response => {
      if (!response.ok) {
          throw new Error('Errore durante il salvataggio del messaggio: ' + response.status);
      }
      return response.json();
  })
  .then(data => {
      console.log('Messaggio salvato con successo:', data);
  })
  .catch(error => {
      console.error('Errore durante il salvataggio del messaggio:', error);
  });
}


selectIdChat(idProgetto)
  .then(chatId1 => {
      room = chatId1;
      nomeArtista = usernameSession.user;
      console.log("user:" + nomeArtista + ". idroom: " + room);
      myModal.hide();
      socket.emit("join room", room);
      console.log('Chat ID salvato in sessione:', chatId1, room);

      
      fetchMessagesByProjectId(idProgetto)
          .then(messages => {
              console.log('Messaggi del progetto:', messages);
              messageData = messages; 
              displayMessages();
          })
          .catch(error => {
              console.error('Errore durante il recupero dei messaggi:', error);
          });
  })
  .catch(error => {
      insertNewChat(idProgetto).then(result => {
          if (result) {
              console.log(result);
          } else {
              console.log("errore");
          }
      })
      .catch(error => {
          console.error('Errore durante il recupero/creazione chat:', error);
      });
  });


form.addEventListener("submit", (e) => {
  e.preventDefault();
  if (input.value) {
      const data = new Date().toISOString().slice(0, 19).replace('T', ' ');
      saveMessageToServer(nomeArtista, input.value,room);
      socket.emit("chat message", room, {
          nomeArtista,
          contenuto: input.value,
          data,
      }); 
      input.value = "";
  }
});


let messageData = []; 


socket.on("chat message", function (message) {
  messageData.push(message); 
  location.reload();
  displayMessages(); 
  
});


function displayMessages() {
  messages.innerHTML = messageData
      .map((message) => {
          if (message.nomeArtista === usernameSession.user) {
              return `<li style="text-align: right;">Io (${message.data}): ${message.contenuto}</li><br>`;
          } else {
              return `<li>${message.nomeArtista} (${message.data}): ${message.contenuto}</li><br>`;
          }
      })
      .join("");
}
