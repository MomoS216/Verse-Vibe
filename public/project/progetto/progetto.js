const idProgetto = sessionStorage.getItem("idProgetto");
const div = document.getElementById("prova");
const aggiungiBtn = document.getElementById("aggiungiBtn");
const chat = document.getElementById("chatButton");
const saveText = document.getElementById("save");
const player = document.getElementById('player'); 
let datiProgetto;
let type;


function deleteTesto(id) {
  return new Promise((resolve, reject) => {
    fetch(`/text/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Errore durante l\'eliminazione del progetto');
      }
      return response.json();
    })
    .then(data => {
      resolve(data);
    })
    .catch(error => {
      reject(error);
    });
  });
}


const insertNewMessage = (messages) => {
  return new Promise((resolve, reject) => {
    fetch('/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ messages }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then((data) => {
        resolve(data);
      })
      .catch((error) => {
        reject(error);
      });
  });
};

const selectProgetto = (data) => {
  return new Promise((resolve, reject) => {
    fetch("/progettoById", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Errore durante la richiesta del progetto");
        }
        return response.json();
      })
      .then((json) => {
        resolve(json);
      })
      .catch((error) => {
        reject(error);
      });
  });
};

const fetchMessagesByProjectId = (projectId) => {
  return new Promise((resolve, reject) => {
    fetch('/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ idProgetto: projectId }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then((data) => {
        resolve(data);
      })
      .catch((error) => {
        reject(error);
      });
  });
};

const insertNewText = (contenuto, idProgetto, nomeArtista) => {
  return new Promise((resolve, reject) => {
    fetch('/newTesto', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ contenuto: contenuto, idProgetto: idProgetto, nomeArtista: nomeArtista }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then((data) => {
        resolve(data);
      })
      .catch((error) => {
        reject(error);
      });
  });
};

const fetchTextsByProjectId = (idProgetto) => {
  return new Promise((resolve, reject) => {
    fetch('/testiProgetto', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ idProgetto }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then((data) => {
        resolve(data);
      })
      .catch((error) => {
        reject(error);
      });
  });
};

const fetchAudioByProjectId = (idProgetto) => {
  return new Promise((resolve, reject) => {
    fetch('/selectAudio', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ idProgetto })
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Errore durante il recupero dei file audio');
      }
      return response.json();
    })
    .then(data => {
      resolve(data);
    })
    .catch(error => {
      reject(error);
    });
  });
};



const updateText = (id,testo) => {
  return new Promise((resolve, reject) => {
    fetch('/updateText', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ id:id, testo:testo })
    })
    .then(response => {
      if (!response) {
        throw new Error('Errore durante il recupero dei file audio');
      }
      return response.json();
    })
    .then(data => {
      resolve(data);
    })
    .catch(error => {
      reject(error);
    });
  });
};






fetchAudioByProjectId(idProgetto)
  .then(audioFiles => {
    console.log('File audio del progetto:', audioFiles);
    if (audioFiles.length > 0) {
      audioFiles.forEach(file => {
        const audioElement = document.createElement('audio');
        audioElement.controls = true;
        audioElement.innerHTML = `
          <source src="/audio/${file.path}" type="audio/mpeg">
          Your browser does not support the audio element.
        `;
        player.appendChild(audioElement);
      });
    } else {
      player.innerHTML = 'Nessun file audio disponibile per questo progetto.';
    }
  })
  .catch(error => {
    console.error('Errore:', error);
    player.innerHTML = 'Si è verificato un errore durante il caricamento dei file audio.';
  });




  function render(idP) {
    selectProgetto({ id: idP }).then((result) => {
      console.log(result);
      let nomeProgetto = result.progetto[0].nome;
      if (result.progetto[0].tipo == 0) {
        chat.style.display = "none";
      } else {
        chat.style.display = "block";
      }
      console.log(result.progetto[0].tipo);
      document.getElementById('username').innerHTML = nomeProgetto;
      datiProgetto = result.progetto[0];
      fetchTextsByProjectId(idProgetto).then((testi) => {
        let html = "";
        for (let i = 0; i < testi.result.length; i++) {
          console.log("testo id"+testi.result[i].id);
          html += `      
            <div class="form-floating">
              <textarea class="form-control box" placeholder="Leave a comment here" id="${testi.result[i].id}" style="height: 100px">${testi.result[i].contenuto}</textarea>
              <button type="button" class="btn btn-danger delete-text" id="delete_${testi.result[i].id}"><span class="material-symbols-outlined">
              delete
              </span></button>
              <label for="floatingTextarea2">Text</label>
            </div><br>`;
        }
        div.innerHTML = html;
  
        let pulsantiDelete = document.querySelectorAll('.delete-text');
      
        pulsantiDelete.forEach((button2) => {
          button2.onclick = () => {
            const id = button2.id.split('_')[1];
            console.log('Hai cliccato sul pulsante Delete con ID del progetto:', id);
            deleteTesto(id)
            .then(() => {
            location.reload();
            })
            .catch((error) => {
              alert("Errore durante l'eliminazione del testo: " + error);
            });
          };
        });



        adjustTextareaHeight();
  
      });
    }).catch((error) => {
      console.log("nessun progetto  " + error);
    });
  }
  

function adjustTextareaHeight() {
  const textareas = document.querySelectorAll('.box');

  textareas.forEach((textarea) => {
    // Adjust height based on content on page load
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';

    // Adjust height dynamically as content changes
    textarea.addEventListener('input', () => {
      textarea.style.height = 'auto';
      textarea.style.height = textarea.scrollHeight + 'px';
    });
  });
}




aggiungiBtn.onclick = () => {
  insertNewText("Nuovo Testo....", idProgetto, datiProgetto.nomeArtista).then((result) => {
    console.log(result);
    render(idProgetto);
  })
}

if (idProgetto != -1) {
  render(idProgetto);
} else {
  window.location.href = './home/home.html';
}



saveText.addEventListener("click", () => {
  const textareas = document.querySelectorAll(".box");

  textareas.forEach((textarea) => {
    const idTesto = textarea.id;
    const valoreModificato = textarea.value;

    updateText(idTesto, valoreModificato)
      .then((result) => {
        // Creazione del messaggio di salvataggio
        const saveMessageContainer = document.getElementById("saveMessageContainer");
        const saveMessage = document.createElement("div");
        saveMessage.textContent = "Salvataggio completato!";
        saveMessage.classList.add("alert", "alert-success");
        saveMessage.setAttribute("role", "alert");
        saveMessageContainer.innerHTML = ""; // Rimuove eventuali messaggi precedenti
        saveMessageContainer.appendChild(saveMessage);

        // Nascondi il messaggio dopo 5 secondi
        setTimeout(() => {
          saveMessage.remove();
        }, 3000);
      })
      .catch((error) => {
        console.error(`Errore durante il salvataggio delle modifiche al testo con ID ${idTesto}: ${error}`);
      });
  });
});

