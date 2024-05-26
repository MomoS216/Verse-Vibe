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
    let contenuto=input.value;
      const data = new Date().toISOString().slice(0, 19).replace('T', ' ');
      saveMessageToServer(nomeArtista, input.value,room);
      socket.emit("chat message", room, {
           nomeArtista,
          contenuto,
           data
      }); 
      input.value = "";
  }
});


let messageData = []; 


socket.on("chat message", function (message) {
  messageData.push(message); 
 // location.reload();
  displayMessages(); 
  console.log("messaggio"+ JSON.stringify(message));
});


function displayMessages() {
    let lastDate = "";

    messages.innerHTML = messageData
        .map((message) => {
            const messageDate = new Date(message.data).toDateString();

            let dateHeader = "";
            if (messageDate !== lastDate) {
                dateHeader = `
                <li class="text-center small text-muted my-2">${formatDatestamp(message.data)}</li>`;
                lastDate = messageDate;
            }

            if (message.nomeArtista === usernameSession.user) {
                return `
                ${dateHeader}
                <li class="d-flex justify-content-end mb-4">
                    <div class="card mask-custom" style="width: fit-content; max-width: 50%;">
                        <div class="card-header d-flex justify-content-between p-3 align-items-center" style="border-bottom: 1px solid rgba(255,255,255,.3);">
                            <p class="fw-bold mb-0" style="margin-right: 10px;">Io</p>
                            <p class="small mb-0"><i class="far fa-clock"></i>${formatTimestamp(message.data)}</p>
                        </div>
                        <div class="card-body">
                            <p class="mb-0">${message.contenuto}</p>
                        </div>
                    </div>
                </li>`;
            } else {
                return `
                ${dateHeader}
                <li class="d-flex justify-content-start mb-4">
                    <div class="card mask-custom" style="width: fit-content; max-width: 50%;">
                        <div class="card-header d-flex justify-content-between align-items-center">
                            <p class="fw-bold mb-0 me-3">${message.nomeArtista}</p>
                            <div>
                                <p class="small mb-0"><i class="far fa-clock"></i>${formatTimestamp(message.data)}</p>
                            </div>
                        </div>
                        <div class="card-body">
                            <p class="mb-0">${message.contenuto}</p>
                        </div>
                    </div>
                </li>`;
            }
        })
        .join("");
}

function formatTimestamp(timestamp) {
    const date = new Date(timestamp);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
}

function formatDatestamp(timestamp) {
    const date = new Date(timestamp);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // I mesi sono indicizzati da 0
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}
