const express = require("express");
const http = require("http");
const path = require("path");
const app = express();
const fs = require("fs");
const mysql = require("mysql2");
const { error } = require("console");
const conf = require("./conf.js");
console.log(conf);
const connection = mysql.createConnection(conf);
const bodyParser = require("body-parser");
let domandeLista;
let risposteLista;
let resp;
let classifica = [];

app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  }),
);

app.use("/", express.static(path.join(__dirname, "public")));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '/public/index.html'));
});

const leggiFile = (path) => {
  return new Promise((resolve, reject) => {
    fs.readFile(path, "utf8", (err, data) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(data);
    });
  });
};

const executeQuery = (sql) => {
  return new Promise((resolve, reject) => {
    connection.query(sql, function (err, result) {
      if (err) {
        console.error(err);
        reject();
      }
      console.log("done");
      resolve(result);
    });
  });
};

const queries = [
  `CREATE TABLE IF NOT EXISTS utente(
    nome VARCHAR(15) PRIMARY KEY,
    password VARCHAR(15) NOT NULL,
    email VARCHAR(15) NOT NULL
  );`,
  `CREATE TABLE IF NOT EXISTS progetto(
    id INT AUTO_INCREMENT PRIMARY KEY,
    data DATE NOT NULL,
    nome VARCHAR(15) NOT NULL,
    tipo BOOLEAN NOT NULL,
    nomeArtista VARCHAR(15),
    FOREIGN KEY (nomeArtista) REFERENCES utente(nome) ON DELETE CASCADE ON UPDATE CASCADE
  );`,
  `CREATE TABLE IF NOT EXISTS partecipa(
    nomeArtista VARCHAR(15),
    idProgetto INT,
    PRIMARY KEY (nomeArtista, idProgetto),
    FOREIGN KEY (nomeArtista) REFERENCES utente(nome) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (idProgetto) REFERENCES progetto(id) ON DELETE CASCADE ON UPDATE CASCADE
  );`,
  `CREATE TABLE IF NOT EXISTS chat(
    id INT AUTO_INCREMENT PRIMARY KEY,
    idProgetto INT,
    FOREIGN KEY (idProgetto) REFERENCES progetto(id) ON DELETE CASCADE ON UPDATE CASCADE
  );`,
  `CREATE TABLE IF NOT EXISTS messaggio(
    id INT AUTO_INCREMENT PRIMARY KEY,
    contenuto VARCHAR(255) NOT NULL,
    nomeArtista VARCHAR(15),
    idChat INT,
    FOREIGN KEY (nomeArtista) REFERENCES utente(nome) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (idChat) REFERENCES chat(id) ON DELETE CASCADE ON UPDATE CASCADE
  );`
];

async function createTables() {
  try {
    for (let query of queries) {
      await executeQuery(query);
    }
    console.log('tabelle controllate');
  } catch (error) {
    console.error('Failed to create tables:', error);
  } finally {
    connection.end();
  }
}

createTables();

//INSERTS
const insertUtente = (nome, password, email) => {
    const sql = `
        INSERT INTO utente (nome, password, email) VALUES ('${nome}', '${password}', '${email}')
    `;
    return executeQuery(sql);
};

const insertProgetto = (data, nome, tipo, nomeArtista) => {
  const sql = `
    INSERT INTO progetto (data, nome, tipo, nomeArtista) VALUES ('${data}', '${nome}', ${tipo}, '${nomeArtista}')
  `;
  return executeQuery(sql);
};

const insertPartecipazione = (nomeArtista, idProgetto) => {
    const sql = `
        INSERT INTO partecipa (nomeArtista, idProgetto) VALUES ('${nomeArtista}', ${idProgetto})
    `;
    return executeQuery(sql);
};

const insertChat = () => {
    const sql = `
        INSERT INTO chat () VALUES ()
    `;
    return executeQuery(sql);
};

const insertMessaggio = (contenuto, nomeArtista, idChat) => {
    const sql = `
        INSERT INTO messaggio (contenuto, nomeArtista, idChat) VALUES ('${contenuto}', '${nomeArtista}', ${idChat})
    `;
    return executeQuery(sql);
};

//DELETS
const deleteUtente = (nome) => {
  const sql = `
    DELETE FROM utente WHERE nome = '${nome}';
  `;
  return executeQuery(sql);
};

const deleteProgetto = (id) => {
  const sql = `
    DELETE FROM progetto WHERE id = ${id};
  `;
  return executeQuery(sql);
};

const deletePartecipa = (nomeArtista, idProgetto) => {
  const sql = `
    DELETE FROM partecipa WHERE nomeArtista = '${nomeArtista}' AND idProgetto = ${idProgetto};
  `;
  return executeQuery(sql);
};

const deleteChat = (id) => {
  const sql = `
    DELETE FROM chat WHERE id = ${id};
  `;
  return executeQuery(sql);
};

const deleteMessaggio = (id) => {
  const sql = `
    DELETE FROM messaggio WHERE id = ${id};
  `;
  return executeQuery(sql);
};


//SELECTS
const selectProgetti = (nome) => {
  const sql = `
    SELECT * FROM progetto where nomeArtista=${nome}
  `;
  return executeQuery(sql);
};

const selectChatByArtist = (nomeArtista) => {
  const sql = `
    SELECT chat.id, messaggio.id AS messaggio_id, messaggio.contenuto, messaggio.nomeArtista 
    FROM chat 
    JOIN messaggio ON chat.id = messaggio.idChat 
    WHERE messaggio.nomeArtista = '${nomeArtista}';
  `;
  return executeQuery(sql);
};

const selectUtente = (nomeUtente) => {
  const sql = `
    SELECT * FROM utente 
    WHERE nome = '${nomeUtente}';
  `;
  return executeQuery(sql);
};

const selectAllUtenti = () => {
  const sql = `
    SELECT * FROM utente;
  `;
  return executeQuery(sql);
};

const selectProgettiFeat = (nomeUtente) => {
  const sql = `
    SELECT p.*
    FROM progetto p
    WHERE (p.id IN (
            SELECT idProgetto
            FROM partecipa
            WHERE nomeArtista = '${nomeUtente}'
          )
          AND p.nomeArtista = '${nomeUtente}'
          OR p.id IN (
            SELECT idProgetto
            FROM partecipa
            WHERE idProgetto = p.id
            AND nomeArtista != '${nomeUtente}'
          ))
          AND p.tipo = 1;
  `;
  return executeQuery(sql);
};

const selectMieiProgettiSolo = (nomeUtente) => {
  const sql = `
    SELECT *
    FROM progetto
    WHERE nomeArtista = '${nomeUtente}' AND tipo = 0;
  `;
  return executeQuery(sql);
};







app.get("/questions", (req, res) => {
  res.json({ questions: domandeLista });
});

app.post("/answers", (req, res) => {
  let points = 0;
  let data = req.body.answers;
  req.body.timestamp = new Date().toISOString();
  if (data.length > 0) {
    for (let i = 0; i < data.length; i++) {
      for (let j = 0; j < risposteLista.length; j++) {
        if (risposteLista[j].id == data[i].id) {
          points += risposteLista[j].points[data[i].value];
        }
      }
    }
    classifica.push({
      username: req.body.username,
      timestamp: req.body.timestamp,
      rating: points,
    });
    console.log();
    res.json({ result: "Ok" });
  }
});


    const server = http.createServer(app);
    server.listen(80, () => {
      console.log("- server running");
    });
