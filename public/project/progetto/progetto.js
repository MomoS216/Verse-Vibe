const idProgetto = sessionStorage.getItem("idProgetto");
const div = document.getElementById("prova");
const testoBtn = document.getElementById("inputTesto");
const aggiungiBtn = document.getElementById("aggiungiBtn");
let datiProgetto;

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
    let nomeProgetto = result.progetto[0].nome;
    document.getElementById('username').innerHTML = nomeProgetto;
    datiProgetto = result.progetto[0];
    fetchTextsByProjectId(idProgetto).then((testi) => {
      let html = "";
      for (let i = 0; i < testi.result.length; i++) {
        html += `<input type="text" value="${testi.result[i].contenuto}" /><br>`;
      }
      div.innerHTML = html;
    });
  }).catch((error) => {
    console.log("nessun progetto  " + error);
  });
}

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

