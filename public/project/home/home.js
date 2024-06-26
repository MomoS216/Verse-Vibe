// Inizializzazione delle variabili di sessione
sessionStorage.setItem("idProgetto", -1);
console.log("Sessione feat:", sessionStorage.getItem("feat"));

// Selezione degli elementi DOM
const divFeat = document.getElementById("feat");
const divSolo = document.getElementById("solo");

const btnModalSolo = document.getElementById("CreateProjectSolo");
const btnModalFeat = document.getElementById("CreateProjectFeat");

const inputTitleSolo = document.getElementById("nameProjectSolo");
const inputTitleFeat = document.getElementById("nameProjectFeat");
const inputArtistFeat = document.getElementById("nameArtist");

const itemsContainer = document.getElementById('itemsContainer');
let items = [];

function deleteProgetto(idProgetto) {
  return new Promise((resolve, reject) => {
    fetch(`/project/${idProgetto}`, {
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


// Funzione per il fetch dei progetti solo
const fetchSoloProjects = (username) => {
  return new Promise((resolve, reject) => {
    fetch('/soloProgects', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username })
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Errore durante il recupero dei progetti personali');
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

// Funzione per il fetch dei progetti feat
const fetchFeatProjects = (username) => {
  return new Promise((resolve, reject) => {
    fetch('/featProgects', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username })
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Errore durante il recupero dei progetti feat');
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

// Funzione per inserire partecipazione
function insertPartecipazioneFetch(nomeArtista, idProgetto) {
  return new Promise((resolve, reject) => {
    fetch('/collaborazioni', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        nomeArtista: nomeArtista,
        idProgetto: idProgetto
      })
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Errore durante la richiesta al server');
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

// Funzione per selezionare progetto
function selectProgetto(nome1, user) {
  return new Promise((resolve, reject) => {
    fetch('/progettoByName', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        nome: nome1,
        username: user
      })
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Errore durante la richiesta al server');
      }
      return response.json();
    })
    .then(data => {
      console.log(data);
      resolve(data);
    })
    .catch(error => {
      reject(error);
    });
  });
}

// Fetch all users
fetch('/allUsers')
  .then(response => {
    if (!response.ok) {
      throw new Error('Errore durante la richiesta al server');
    }
    return response.json();
  })
  .then(data => {
    items = data.Users.map(user => user.nome); 
    console.log(items); 
  })
  .catch(error => {
    console.error(error);
  });

// Filtrare gli items
const filterItems = (searchTerm) => {
  const term = searchTerm.toLowerCase();
  const filteredItems = items.filter(item => item.toLowerCase().includes(term));
  return filteredItems;
};

// Aggiornare l'interfaccia utente
const updateUI = (filteredItems) => {
  itemsContainer.innerHTML = '';

  filteredItems.forEach(item => {
    const optionItem = document.createElement('option');
    optionItem.value = item; 
    itemsContainer.appendChild(optionItem);
  });
};

inputArtistFeat.addEventListener('input', (event) => {
  const searchTerm = event.target.value;
  const filteredItems = filterItems(searchTerm);
  updateUI(filteredItems);
});

// Render progetti
function renderPrimario() {
  fetchSoloProjects(username.user)
  .then((result) => {
    if (result.result.length != 0) {
      console.log(result.result);
      divSolo.innerHTML = render(result.result);
      let pulsantiProgetto = document.querySelectorAll('.progetto');
      let pulsantiDelete = document.querySelectorAll('.delete-progetto');
      
      pulsantiProgetto.forEach((button1) => {
        button1.onclick = () => {
          const id = button.id;
          console.log('Hai cliccato sul pulsante con ID del progetto:', id);
          sessionStorage.setItem("idProgetto", id);
          sessionStorage.setItem("solo", 1);
          return window.location.href = "../progetto/progetto.html";
        };
      });

      pulsantiDelete.forEach((button2) => {
        button2.onclick = () => {
          const id = button.id.split('_')[1];
          console.log('Hai cliccato sul pulsante Delete con ID del progetto:', id);
          deleteProgetto(id)
          .then(() => {
            renderPrimario(); 
          })
          .catch((error) => {
            alert("Errore durante l'eliminazione del progetto: " + error);
          });
        };
      });

      
    } else {
      divSolo.innerHTML = "Ancora nessun progetto SOLO";
    }
  })
  .catch((error) => {
    divSolo.innerHTML = "Errore durante il recupero dei progetti solo: " + error;
  });

  fetchFeatProjects(username.user)
  .then((result) => {
    if (result.result.length != 0) {
      console.log(result.result);
      divFeat.innerHTML = render(result.result);
      let pulsantiProgetto = document.querySelectorAll('.progetto');
      let pulsantiDelete = document.querySelectorAll('.delete-progetto');
      
      pulsantiProgetto.forEach((button) => {
        button.onclick = () => {
          const id = button.id;
          console.log('Hai cliccato sul pulsante con ID del progetto:', id);
          sessionStorage.setItem("idProgetto", id);
          sessionStorage.setItem("feat", 1);
          return window.location.href = "../progetto/progetto.html";
        };
      });

      pulsantiDelete.forEach((button) => {
        button.onclick = () => {
          const id = button.id.split('_')[1];
          console.log('Hai cliccato sul pulsante Delete con ID del progetto:', id);
          deleteProgetto(id)
          .then(() => {
            renderPrimario(); // Ricarica i progetti dopo l'eliminazione
          })
          .catch((error) => {
            alert("Errore durante l'eliminazione del progetto: " + error);
          });
        };
      });
    } else {
      divFeat.innerHTML = "Ancora nessun progetto FEAT";
    }
  })
  .catch((error) => {
    divFeat.innerHTML = "Errore durante il recupero dei progetti feat: " + error;
  });
}


const render = (array) => {
  let template = "";
  array.forEach((item, index) => {
    template += `
      <tr>
        <td>${item.nome}</td>
        <td>
          <button type="button" class="btn btn-info progetto" id="${item.id}">Open</button>
          <button type="button" class="btn btn-danger delete-progetto" id="delete_${item.id}">Delete</button>
        </td>
      </tr>`;
  });
  return template;
};




function provaProgetto(data, nome, tipo, nomeArtista) {
  return new Promise((resolve, reject) => {
    fetch('/prova1', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({data: data, nome: nome, tipo: tipo, nomeArtista: nomeArtista}),
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Errore durante la richiesta al server');
      }
      return response.json();
    })
    .then(data => {
      console.log(data);
      resolve(data);
    })
    .catch(error => {
      reject(error);
    });
  });
}

if (username.log) {
  updateUI(items);

  btnModalSolo.onclick = () => {
    const currentDate = new Date();
    const formattedDate = currentDate.toISOString().split('T')[0];
    console.log(formattedDate);
    console.log(username);
    provaProgetto(formattedDate, inputTitleSolo.value, 0, username.user)
      .then((result) => {
        if(result.message){
          renderPrimario();
          inputTitleSolo.value="";
          sessionStorage.setItem("idProgetto", result.id);
          window.location.href = "../progetto/progetto.html";
        }
      })
      .catch((error) => {
        alert(error);
      });
  }



  btnModalFeat.onclick = () => {
    const currentDate = new Date();
    const formattedDate = currentDate.toISOString().split('T')[0];
    console.log(formattedDate);
    let titolo = inputTitleFeat.value;
    let artista = inputArtistFeat.value;
let idNewProject;
    provaProgetto(formattedDate, titolo, 1, username.user)
      .then((result) => {
        idNewProject=result.id;
      })
      .catch((error) => {
        alert(error);
      });

    selectProgetto(titolo, username.user)
      .then((result) => {  
        console.log("select ", result);
        dato = result.progetto;
        console.log(result);

        insertPartecipazioneFetch(artista, result.progetto[0].id)
          .then((result) => {  
            renderPrimario();
             inputTitleFeat.value="";
            inputArtistFeat.value="";
            sessionStorage.setItem("idProgetto", idNewProject);
            window.location.href = "../progetto/progetto.html";
            
          })
          .catch((error) => {
            alert(error);
          });
      })
      .catch((error) => {
        alert(error);
      });
  }

  renderPrimario();
}
