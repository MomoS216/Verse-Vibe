const idProgetto = sessionStorage.getItem("idProgetto");
const div = document.getElementById("prova");
const testoBtn = document.getElementById("inputTesto");
const aggiungiBtn = document.getElementById("aggiungiBtn");
const chat = document.getElementById("chatButton");
let datiProgetto;
let type;

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
        html += `<textarea id="${testi.result[i].id}" class="box" rows="4" cols="50">${testi.result[i].contenuto}</textarea><br>`;
      }
      div.innerHTML = html;

      // Call adjustTextareaHeight after updating the innerHTML
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

// Example call to render function
render(1);







aggiungiBtn.onclick = () => {
  insertNewText(testoBtn.value, idProgetto, datiProgetto.nomeArtista).then((result) => {
    console.log(result);
    render(idProgetto);
    testoBtn.value = "";
  })
}

if (idProgetto != -1) {
  render(idProgetto);
} else {
  window.location.href = './home/home.html';
}



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


const player = document.getElementById('player'); 

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