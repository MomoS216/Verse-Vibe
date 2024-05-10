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

app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  }),
);

app.use("/", express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "/public/project/index.html"));
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
    password VARCHAR(255) NOT NULL,
    email VARCHAR(50) NOT NULL UNIQUE
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
  `CREATE TABLE IF NOT EXISTS testo(
    id INT AUTO_INCREMENT PRIMARY KEY,
    contenuto TEXT NOT NULL,
    idProgetto INT,
    nomeArtista VARCHAR(15),
    FOREIGN KEY (idProgetto) REFERENCES progetto(id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (nomeArtista) REFERENCES utente(nome) ON DELETE CASCADE ON UPDATE CASCADE
  );`,
  `CREATE TABLE IF NOT EXISTS chat(
    id INT AUTO_INCREMENT PRIMARY KEY,
    idProgetto INT,
    FOREIGN KEY (idProgetto) REFERENCES progetto(id) ON DELETE CASCADE ON UPDATE CASCADE
  );`,
  `CREATE TABLE IF NOT EXISTS messaggio(
    id INT AUTO_INCREMENT PRIMARY KEY,
    contenuto TEXT NOT NULL,
    nomeArtista VARCHAR(15),
    idChat INT,
    data DATETIME NOT NULL, 
    FOREIGN KEY (nomeArtista) REFERENCES utente(nome) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (idChat) REFERENCES chat(id) ON DELETE CASCADE ON UPDATE CASCADE
  );`,
];

async function createTables() {
  try {
    for (let query of queries) {
      await executeQuery(query);
    }
    console.log("tabelle controllate");
  } catch (error) {
    console.error("Failed to create tables:", error);
  }
}

createTables();

//INSERTS
const insertUtente = (nome, password, email) => {
  const sql = `
        INSERT INTO utente (nome, password, email) VALUES ('${nome}', '${password}', '${email}')
    `;
  console.log(sql);
  return executeQuery(sql);
};

const insertProgetto = (data, nome, tipo, nomeArtista) => {
  const sql = `
    INSERT INTO progetto (data, nome, tipo, nomeArtista) VALUES ('${data}', '${nome}', ${tipo}, '${nomeArtista}')
  `;
  console.log(sql);
  return executeQuery(sql);
};

const insertTesto = (contenuto, idProgetto, nomeArtista) => {
  const sql = `
    INSERT INTO testo (contenuto, idProgetto, nomeArtista) 
    VALUES ('${contenuto}', ${idProgetto}, '${nomeArtista}');
  `;
  return executeQuery(sql);
};

const insertPartecipazione = (nomeArtista, idProgetto) => {
  const sql = `
        INSERT INTO partecipa (nomeArtista, idProgetto) VALUES ('${nomeArtista}', ${idProgetto})
    `;
  return executeQuery(sql);
};

const insertChat = (idProgetto) => {
  const sql = `
        INSERT INTO chat (idProgetto) VALUES (${idProgetto})
    `;
  return executeQuery(sql);
};

const insertMessaggio = (contenuto, nomeArtista, idChat, data) => {
  const sql = `
        INSERT INTO messaggio (contenuto, nomeArtista, idChat, data) VALUES ('${contenuto}', '${nomeArtista}', ${idChat}, ${data})
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

const deleteTestoById = (idTesto) => {
  const sql = `
    DELETE FROM testo
    WHERE id = ${idTesto};
  `;
  return executeQuery(sql);
};

//SELECTS
const selectTestiByProgettoId = (idProgetto) => {
  const sql = `
    SELECT *
    FROM testo
    WHERE idProgetto = ${idProgetto};
  `;
  return executeQuery(sql);
};

const selectMessagesByProjectId = (projectId) => {
  const sql = `
    SELECT m.id AS message_id, m.contenuto, m.nomeArtista, m.data
    FROM messaggio m
    JOIN chat c ON m.idChat = c.id
    WHERE c.idProgetto = ${projectId}
    ORDER BY m.data ASC;
  `;
  return executeQuery(sql);
};

const selectUtenteLogin = (nomeUtente) => {
  const sql = `
    SELECT * FROM utente 
    WHERE nome = '${nomeUtente}';
  `;
  return executeQuery(sql);
};

const selectAllUtenti = () => {
  const sql = `
    SELECT nome,email FROM utente;
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

const selectProgettoName = (nome) => {
  const sql = `
    SELECT *
    FROM progetto
    WHERE nome = '${nome}';
  `;
  return executeQuery(sql);
};

const selectProgettoId = (id) => {
  const sql = `
    SELECT *
    FROM progetto
    WHERE id = '${id}';
  `;
  return executeQuery(sql);
};

//SERVIZI
const bcrypt = require('bcrypt');

app.post("/registrazione", (req, res) => {
  if (!req.body.username || !req.body.password || !req.body.email) {
    return res.status(400).json({ error: "Nome, password ed email sono richiesti" });
  }
  let username = req.body.username;
  let email = req.body.email;
  // Hash della password
  bcrypt.hash(req.body.password, 10, (err, hash) => {
    if (err) {
      return res.status(500).json({err});
    }
    // Salva l'utente con la password hashata
    insertUtente(username, hash, email)
      .then(() => {
        res.json({ message: "Utente inserito correttamente" });
      })
      .catch((error) => {
        res.status(500).json({ error });
      });
  });
});

app.post("/login", (req, res) => {
  if (!req.body.username || !req.body.password) {
    return res.status(400).json({ error: "Username e password sono richiesti" });
  }
  let username = req.body.username;
  let password = req.body.password;
  // Seleziona l'utente dal database
  selectUtenteLogin(username)
    .then((result) => {
      if (!result) {
        return res.status(404).json({ error: "Utente non trovato" });
      }
      // Confronta la password hashata con quella fornita dall'utente
      bcrypt.compare(password, result[0].password, (err, match) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        if (match) {
          res.json({ result: true,
            userData : result[0]
           });
        } else {
          res.json({ result: false });
        }
      });
    })
    .catch((error) => {
      res.status(500).json({ error: error.message });
    });
});




app.get("/allUsers", (req, res) => {
  selectAllUtenti()
    .then((result) => {
      res.json({ Users: result });
    })
    .catch((error) => {
      res.status(500).json({ error: error.message });
    });
});


app.post("/progettoByName", (req, res) => {
  console.log("progetto"+req.body.nome);
  selectProgettoName(req.body.nome)
    .then((result) => {
      res.json({ progetto: result });
    })
    .catch((error) => {
      res.status(500).json({ error: error.message });
    });
});

app.post("/progettoById", (req, res) => {
  console.log("progetto"+req.body.id);
  selectProgettoId(req.body.id)
    .then((result) => {
      res.json({ progetto: result });
    })
    .catch((error) => {
      res.status(500).json({ error: error.message });
    });
});


app.post("/soloProgects", (req, res) => {
  if (!req.body.username) {
    return res.status(400).json({ error: "Nome Artista richiesto" });
  }
  let username = req.body.username;

  selectMieiProgettiSolo(username)
    .then((result) => {
      if (!result) {
        return res.status(404).json({ error: "Ancora nessun progetto solo" });
      } else {
        res.json({ result: result });
      }
    })
    .catch((error) => {
      res.status(500).json({ error: error.message });
    });
});

app.post("/featProgects", (req, res) => {
  if (!req.body.username) {
    return res.status(400).json({ error: "Nome Artista richiesto" });
  }
  let username = req.body.username;

  selectProgettiFeat(username)
    .then((result) => {
      console.log(result);
      if (!result) {
        return res.status(404).json({ error: "Ancora nessun progetto feat" });
      } else {
        res.json({ result: result });
      }
    })
    .catch((error) => {
      res.status(500).json({ error: error.message });
    });
});

app.post("/chat", (req, res) => {
  if (!req.body.idProgetto) {
    return res.status(400).json({ error: "id Progetto richiesto" });
  }
  let id = req.body.idProgetto;

  selectMessagesByProjectId(id)
    .then((result) => {
      if (!result) {
        return res
          .status(404)
          .json({ error: "nessuna chat per questo progetto" });
      } else {
        res.json({ result: result });
      }
    })
    .catch((error) => {
      res.status(500).json({ error: error.message });
    });
});

app.post("/testiProgetto", (req, res) => {
  if (!req.body.idProgetto) {
    return res.status(400).json({ error: "id Progetto richiesto" });
  }
  let id = req.body.idProgetto;

  selectTestiByProgettoId(id)
    .then((result) => {
      if (!result) {
        return res
          .status(404)
          .json({ error: "nessuna chat per questo progetto" });
      } else {
        res.json({ result: result });
      }
    })
    .catch((error) => {
      res.status(500).json({ error: error.message });
    });
});

app.post("/nuovoProgetto", (req, res) => {
  if (
    !req.body.data ||
    !req.body.nome ||
    !req.body.tipo ||
    !req.body.nomeArtista
  ) {
    return res
      .status(400)
      .json({ error: "Data, nome, tipo e nome dell'artista sono richiesti" });
  }
  const { data, nome, tipo, nomeArtista } = req.body;
  insertProgetto(data, nome, tipo, nomeArtista)
    .then(() => {
      res.json({ message: "Progetto inserito correttamente" });
    })
    .catch((error) => {
      res.status(500).json({ error: error.message });
    });
});

app.post("/newTesto", (req, res) => {
  if (!req.body.contenuto || !req.body.idProgetto || !req.body.nomeArtista) {
    return res
      .status(400)
      .json({ error: "Contenuto, idProgetto e nomeArtista sono richiesti" });
  }
  const { contenuto, idProgetto, nomeArtista } = req.body;
  insertTesto(contenuto, idProgetto, nomeArtista)
    .then(() => {
      res.json({ message: "Testo inserito correttamente" });
    })
    .catch((error) => {
      res.status(500).json({ error: error.message });
    });
});

app.post("/messages", (req, res) => {
  if (!req.body.messages || !Array.isArray(req.body.messages)) {
    return res.status(400).json({ error: "Array di messaggi richiesto" });
  }
  const messages = req.body.messages;
  Promise.all(
    messages.map(async (message) => {
      try {
        await insertMessaggio(
          message.contenuto,
          message.nomeArtista,
          message.idChat,
          message.data,
        );
      } catch (error) {
        throw error;
      }
    }),
  )
    .then(() => {
      res.json({ message: "Messaggi inseriti correttamente" });
    })
    .catch((error) => {
      res.status(500).json({ error: error.message });
    });
});

app.post("/collaborazioni", (req, res) => {
  if (!req.body.nomeArtista || !req.body.idProgetto) {
    return res
      .status(400)
      .json({ error: "Nome artista e ID progetto sono richiesti" });
  }
  let nomeArtista = req.body.nomeArtista;
  let idProgetto = req.body.idProgetto;
  insertPartecipazione(nomeArtista, idProgetto)
    .then(() => {
      res.json({ message: "Partecipazione inserita correttamente" });
    })
    .catch((error) => {
      res.status(500).json({ error: error.message });
    });
});

app.post("/newChat", (req, res) => {
  if (!req.body.idProgetto) {
    return res.status(400).json({ error: "ID progetto richiesto" });
  }
  let idProgetto = req.body.idProgetto;
  insertChat(idProgetto)
    .then(() => {
      res.json({ message: "Chat creata correttamente" });
    })
    .catch((error) => {
      res.status(500).json({ error: error.message });
    });
});

app.delete("/user/:nome", (req, res) => {
  const nome = req.params.nome;
  deleteUtente(nome)
    .then(() => {
      res.json({ message: "Utente eliminato correttamente" });
    })
    .catch((error) => {
      res.status(500).json({ error: error.message });
    });
});

app.delete("/project/:id", (req, res) => {
  const id = req.params.id;
  deleteProgetto(id)
    .then(() => {
      res.json({ message: "Progetto eliminato correttamente" });
    })
    .catch((error) => {
      res.status(500).json({ error: error.message });
    });
});

app.delete("/participation/:nomeArtista/:idProgetto", (req, res) => {
  const nomeArtista = req.params.nomeArtista;
  const idProgetto = req.params.idProgetto;
  deletePartecipa(nomeArtista, idProgetto)
    .then(() => {
      res.json({ message: "Partecipazione eliminata correttamente" });
    })
    .catch((error) => {
      res.status(500).json({ error: error.message });
    });
});

app.delete("/chat/:id", (req, res) => {
  const id = req.params.id;
  deleteChat(id)
    .then(() => {
      res.json({ message: "Chat eliminata correttamente" });
    })
    .catch((error) => {
      res.status(500).json({ error: error.message });
    });
});

app.delete("/message/:id", (req, res) => {
  const id = req.params.id;
  deleteMessaggio(id)
    .then(() => {
      res.json({ message: "Messaggio eliminato correttamente" });
    })
    .catch((error) => {
      res.status(500).json({ error: error.message });
    });
});

app.delete("/text/:id", (req, res) => {
  const id = req.params.id;
  deleteTestoById(id)
    .then(() => {
      res.json({ message: "Testo eliminato correttamente" });
    })
    .catch((error) => {
      res.status(500).json({ error: error.message });
    });
});

const server = http.createServer(app);
server.listen(5100, () => {
  console.log("- server running");
});
