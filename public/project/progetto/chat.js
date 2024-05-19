


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
  
if(!sessionStorage.getItem("idProgetto") || !sessionStorage.getItem('loggato')){ 
    window.location.href = '../home/home.html';
}
    const idProgetto = sessionStorage.getItem("idProgetto");
    const usernameSession = JSON.parse(sessionStorage.getItem('loggato'));
    const socket = io(); 
    const form = document.getElementById("form");
    const input = document.getElementById("input");
    const register = document.getElementById("register");
    const roomInput = document.getElementById("room");
    const usernameInput = document.getElementById("username"); 
    const messages = document.getElementById("messages");
    const myModal = new bootstrap.Modal("#modalAccedi");
    let room = "";
    let username = "";

    selectIdChat(idProgetto)
    .then(chatId1 => {
         room = chatId1;
         username = usernameSession.user;
            console.log("user:"+ username+". idroom:  "+room)
            myModal.hide();
            socket.emit("join room", room);
      console.log('Chat ID salvato in sessione:', chatId1,room);
    })
    .catch(error => {
        insertNewChat(idProgetto).then(result => {
        if(result){
            console.log(result);
        }else{
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
          const timestamp = new Date().toISOString().slice(0, 19).replace('T', ' ');
            saveMessageToServer(username, input.value);
            socket.emit("chat message", room, {
                username,
                message: input.value,
                timestamp,
            }); 
            input.value = "";
        }
    });

    let messageData = []; 

    socket.on("chat message", function (message) {
        messageData.push(message); 
        displayMessages(); 
    });


    function displayMessages() {
    messages.innerHTML = messageData
        .map((message) => {
            if (message.username === username) {
                return `<li style="text-align: right;" >Io (${message.timestamp}): ${message.message}</li><br>`;
            } else {
                return `<li>${message.username} (${message.timestamp}): ${message.message}</li><br>`;
            }
        })
        .join("");
}



function saveMessageToServer(username, message) {
    fetch('/saveMessage', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            message: {
                contenuto: message,
                nomeArtista: username,
                idChat: room
        
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


