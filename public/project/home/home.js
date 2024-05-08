sessionStorage.setItem("idProgetto", -1);
const divFeat=document.getElementById("feat");
const divSolo=document.getElementById("solo");



// Funzione per ottenere i progetti personali dell'artista
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
  
  // Funzione per ottenere i progetti feat dell'artista
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