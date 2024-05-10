const idProgetto = sessionStorage.getItem("idProgetto");


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
  

if(idProgetto != -1){
selectProgetto({id:idProgetto}) .then((result) => {
let nomeProgetto=result.progetto[0].nome;
document.getElementById('username').innerHTML = nomeProgetto;

})
.catch((error) => {
    console.log("nessun progetto  "+ error);
});







 }else{
 window.location.href = './home/home.html'; 
}

