sessionStorage.setItem("idProgetto", -1);
const divFeat=document.getElementById("feat");
const divSolo=document.getElementById("solo");

const divModal=document.getElementById("divModal");
const divModalSolo=document.getElementById("divModalSolo");
const divModalFeat=document.getElementById("divModalFeat");

const btnModalSolo=document.getElementById("CreateProjectSolo");
const btnModalFeat=document.getElementById("CreateProjectFeat");
const inputTitleSolo=document.getElementById("nameProjectSolo");
const inputTitleFeat=document.getElementById("nameProjectFeat");
const inputArtistFeat=document.getElementById("nameArtist");

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

  function newProject(data1, nome1, tipo1, nomeArtista1) {
    return new Promise((resolve, reject) => {
        fetch('/nuovoProgetto', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                data: data1,
                nome: nome1,
                tipo: tipo1,
                nomeArtista: nomeArtista1
            })
        })
        .then(response => {
          console.log(response);
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

function insertPartecipazione(nomeArtista, idProgetto) {
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

function selectProgetto(nome1) {
  return new Promise((resolve, reject) => {
    fetch('/progettoByName', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        nome: nome1
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

  
  const render = (array) => {
    let template = "";
    array.forEach((item, index) => {
        template += `
        <tr>
          <td>${item.nome}</td>
          <td><button type="button" class="btn btn-info progetto" id="${item.id}">Apri</button></td>
        </tr>`;
      
    });
    return template;
  };






if (username.log) {

  btnModalSolo.onclick = () => {
    const currentDate = new Date();

    const formattedDate = currentDate.toISOString().split('T')[0];
    
console.log(formattedDate);
    newProject(formattedDate, inputTitleSolo.value, 0, username.user)
        .then((result) => {
            alert(result.message); 
        })
        .catch((error) => {
            alert(error);
        });
}


btnModalFeat.onclick = () => {
  const currentDate = new Date();
  const formattedDate = currentDate.toISOString().split('T')[0];
console.log(formattedDate);
  newProject(formattedDate, inputTitleFeat.value, 0, username.user)
      .then((result) => {
        selectProgetto(inputTitleFeat.value).then((result) => {  
insertPartecipazione(inputArtistFeat.value,result.progetto.id).then((result) => {  
  alert(result.message);
          })
          .catch((error) => {
              alert(error);
          });
        })
        .catch((error) => {
            alert(error);
        }); 
      })
      .catch((error) => {
          alert(error);
      });
}

    
  fetchSoloProjects(username.user)
    .then((result) => {
        if(result.result.length!=0){
        //divSolo.innerHTML=JSON.stringify(result);
        divSolo.innerHTML=render(result.result);
        let pulsantiProgetto = document.querySelectorAll('.progetto');
      pulsantiProgetto.forEach((button, index) => {
        button.onclick = () => {
          const id = button.id;
          console.log('Hai cliccato sul pulsante con ID del progetto:', id);
          sessionStorage.setItem("idProgetto", id);
          window.location.href = "../progetto/progetto.html";
        };
      });
    }else{
            divSolo.innerHTML="Ancora nessun progetto SOLO"
        }
    })
    .catch((error) => {
        divSolo.innerHTML="Errore durante il recupero dei progetti solo:  "+ error;
    });
  
  fetchFeatProjects(username.user)
    .then((result) => {
        if(result.result.length!=0){
            //divFeat.innerHTML=JSON.stringify(result);
            divFeat.innerHTML=render(result.result);

            let pulsantiProgetto = document.querySelectorAll('.progetto');
      pulsantiProgetto.forEach((button, index) => {
        button.onclick = () => {
          const id = button.id;
          console.log('Hai cliccato sul pulsante con ID del progetto:', id);
          sessionStorage.setItem("idProgetto", id);
          window.location.href = "../progetto/progetto.html";
        };
      });

        }else{
                divFeat.innerHTML="Ancora nessun progetto FEAT"
            }
    })
    .catch((error) => {
        divFeat.innerHTML="Errore durante il recupero dei progetti feat:  "+ error;
    });
  





}