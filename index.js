const express = require("express");
const http = require("http");
const path = require("path");
const app = express();
const fs = require("fs");
const mysql = require("mysql2");
const { error, Console } = require("console");
const conf = require("./conf.js");
console.log(conf);
const connection = mysql.createConnection(conf);
const bodyParser = require("body-parser");
const socketIO = require("socket.io");
const moment = require('moment-timezone');
const multer = require('multer');

app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: true,
  }),
);

app.use("/", express.static(path.join(__dirname, "public")));

app.use("/audio", express.static(path.join(__dirname, "public/audio")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "/public/project/index.html"));
});

const server = http.createServer(app);

// Creazione dell'istanza di Socket.IO passando il server HTTP
const io = socketIO(server);

// Logica per la gestione dei socket e delle chat
let chats = []; // Array per memorizzare le informazioni sulle chat

io.on("connection", (socket) => {
  console.log("a user connected");

  // Unisciti a una room specifica
  socket.on("join room", (room) => {
    socket.join(room);
    console.log(`User joined room: ${room}`);
    // Se la chat non esiste ancora, la creiamo
    if (!chats.find((chat) => chat.chat === room)) {
      chats.push({ chat: room, messaggi: [] });
    }
  });

  // Ascolta i messaggi di chat e li trasmette a tutti nella stessa room
  socket.on("chat message", (room, { username, message, timestamp }) => {
    io.to(room).emit("chat message", { username, message, timestamp }); // Trasmetti l'username e il messaggio
    let chat = chats.find((chat) => chat.chat === room);
    if (chat) {
      chat.messaggi.push({
        nomeArtista: username,
        data: timestamp,
        contenuto: message,
      });
    }

    console.log(chats);
  });

  socket.on("disconnect", () => {
    console.log("user disconnected");
  });

  socket.on("message", (data) => {});
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

const executeQuery = (sql, params = []) => {
  return new Promise((resolve, reject) => {
      connection.query(sql, params, function (err, result) {
          if (err) {
              console.error(err);
              reject();
              return;
          }
          console.log("done");
          resolve(result);
      });
  });
};


//caricamento file
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '/public/audio'));
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  }
});

const upload = multer({ storage: storage });


app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('Nessun file caricato.');
  }

  res.send('File caricato con successo.');
});












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
  `CREATE TABLE IF NOT EXISTS audio(
    id INT AUTO_INCREMENT PRIMARY KEY,
    path TEXT,
    idProgetto INT,
    FOREIGN KEY (idProgetto) REFERENCES progetto(id) ON DELETE CASCADE ON UPDATE CASCADE
  );`,
  `CREATE TABLE IF NOT EXISTS messaggio(
    id INT AUTO_INCREMENT PRIMARY KEY,
    contenuto TEXT NOT NULL,
    nomeArtista VARCHAR(15),
    idChat INT,
    data TEXT NOT NULL, 
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
const insertAudio = (path, idProgetto) => {
  const sql = `
    INSERT INTO audio (path, idProgetto) VALUES ('${path}', ${idProgetto})
  `;
  console.log(sql);
  return executeQuery(sql);
};

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
    VALUES ('${contenuto}', '${idProgetto}', '${nomeArtista}');
  `;
  console.log(sql);
  return executeQuery(sql);
};

const insertPartecipazione = (nomeArtista, idProgetto) => {
  const sql = `
        INSERT INTO partecipa (nomeArtista, idProgetto) VALUES ('${nomeArtista}', ${idProgetto})
    `;
    console.log(sql);
  return executeQuery(sql);
};

const insertChat = (idProgetto) => {
  const sql = `
        INSERT INTO chat (idProgetto) VALUES (${idProgetto})
    `;
  return executeQuery(sql);
};




const insertMessaggio = (contenuto, nomeArtista, idChat, data) => {
  // Crea un oggetto moment dalla data e imposta il fuso orario italiano
  const dateObj = moment.tz(data, 'Europe/Rome');

  // Converti la data in formato accettato da MySQL (YYYY-MM-DD HH:MM:SS)
  const dataFormatted = dateObj.format('YYYY-MM-DD HH:mm:ss');

  const sql = `
      INSERT INTO messaggio (contenuto, nomeArtista, idChat, data) VALUES (?, ?, ?, ?)
  `;
  executeQuery(sql, [contenuto, nomeArtista, idChat, dataFormatted]).then(result => {
      return true;
  });
};


//DELETS
const deleteAudioByIdProgetto = (id) => {
  const sql = `
    DELETE FROM audio WHERE idProgetto = ${id}
  `;
  console.log(sql);
  return executeQuery(sql);
};


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
    SELECT nome FROM utente;
  `;
  return executeQuery(sql);
};

const selectProgettiFeat = (nomeUtente) => {
  const sql = `
    SELECT DISTINCT p.*
    FROM progetto p
    JOIN partecipa pa ON p.id = pa.idProgetto
    WHERE (p.tipo = 1
          AND (p.nomeArtista = '${nomeUtente}'
          OR pa.nomeArtista = '${nomeUtente}'));
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

const selectProgettoName = (nome, user) => {
  const sql = `
    SELECT *
    FROM progetto
    WHERE nome = '${nome}' AND nomeArtista='${user}';
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

const selectChatId = (idProgetto) => {
  const sql = `
    SELECT id
    FROM chat
    WHERE idProgetto = '${idProgetto}';
  `;
  return executeQuery(sql);
};

const selectAudio = (idProgetto) => {
  const sql = `
    SELECT * FROM audio WHERE idProgetto = ${idProgetto}
  `;
  console.log(sql);
  return executeQuery(sql);
};



//SERVIZI
app.post("/provaIdChat", (req, res) => {
  if (!req.body.idProgetto) {
    return res.status(400).json({ error: "ID progetto richiesto" });
  }
  const idProgetto = req.body.idProgetto;

  selectChatId(idProgetto)
    .then((result) => {
      if (result.length === 0) {
        return res.status(404).json({ error: "Nessuna chat trovata per questo progetto" });
      } else {
        res.json({ chatId: result[0].id });
      }
    })
    .catch((error) => {
      res.status(500).json({ error: error });
    });
});



app.post("/chatId", (req, res) => {
  if (!req.body.idProgetto) {
    return res.status(400).json({ error: "ID progetto richiesto" });
  }
  const idProgetto = req.body.idProgetto;

  selectChatId(idProgetto)
    .then((result) => {
      if (result.length === 0) {
        return res.status(404).json({ error: "Nessuna chat trovata per questo progetto" });
      } else {
        res.json({ chatId: result[0].id });
      }
    })
    .catch((error) => {
      res.status(500).json({ error: error});
    });
});


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
          return res.status(500).json({ error: err });
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
      res.status(500).json({ error: error});
    });
});




app.get("/allUsers", (req, res) => {
  selectAllUtenti()
    .then((result) => {
      res.json({ Users: result });
    })
    .catch((error) => {
      res.status(500).json({ error: error });
    });
});


app.post("/progettoByName", (req, res) => {
  console.log("progetto"+req.body.nome);
  selectProgettoName(req.body.nome,req.body.username)
    .then((result) => {
      res.json({ progetto: result });
    })
    .catch((error) => {
      res.status(500).json({ error: error });
    });
});

app.post("/progettoById", (req, res) => {
  console.log("progetto"+req.body.id);
  selectProgettoId(req.body.id)
    .then((result) => {
      res.json({ progetto: result });
    })
    .catch((error) => {
      res.status(500).json({ error: error });
    });
});


app.post("/soloProgects", (req, res) => {
  if (!req.body.username) {
    return res.status(400).json({ error: "Nome Artista richiesto" });
  }
  let username = req.body.username;
  console.log("usernameSolo"+username);
  selectMieiProgettiSolo(username)
    .then((result) => {
      if (!result) {
        return res.status(404).json({ error: "Ancora nessun progetto solo" });
      } else {
        console.log(result);
        res.json({ result: result });
      }
    })
    .catch((error) => {
      res.status(500).json({ error: error });
    });
});

app.post("/featProgects", (req, res) => {
  if (!req.body.username) {
    return res.status(400).json({ error: "Nome Artista richiesto" });
  }
  let username = req.body.username;
console.log("usernameFeat"+username);
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
      res.status(500).json({ error: error });
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
      res.status(500).json({ error: error });
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
      res.status(500).json({ error: error });
    });
});






app.post("/prova1", (req, res) => {
  const { data, nome, tipo, nomeArtista } = req.body;
  
  insertProgetto(data, nome, tipo, nomeArtista)
    .then(() => {
      let sql = `SELECT id 
                 FROM progetto 
                 WHERE nomeArtista = ?
                   AND data = ?
                   AND nome = ?
                   AND tipo = ?`;

      executeQuery(sql, [nomeArtista, data, nome, tipo])
        .then((result) => {
          if (result.length > 0) {
            res.json({ message: true, id: result[0].id });
          } else {
            res.status(404).json({ message: false, error: "Progetto non trovato." });
          }
        })
        .catch((error) => {
          res.status(500).json({ error: error.message });
        });
    })
    .catch((error) => {
      console.error("Errore durante l'inserimento del progetto:", error);
      res.status(500).json({ error: "Si è verificato un errore durante l'inserimento del progetto." });
    });
});


app.post("/newTesto", (req, res) => {
  if (!req.body.contenuto || !req.body.idProgetto || !req.body.nomeArtista) {
    return res
      .status(400)
      .json({ error: "Contenuto, idProgetto e nomeArtista sono richiesti" });
  }
  console.log("new testo"+JSON.stringify(req.body));
  const contenuto=req.body.contenuto;
  const idProgetto=req.body.idProgetto;
  const nomeArtista=req.body.nomeArtista;
  console.log(contenuto+"   "+idProgetto);
  insertTesto(contenuto, idProgetto, nomeArtista)
    .then(() => {
      res.json({ message: "Testo inserito correttamente" });
    })
    .catch((error) => {
      res.status(500).json({ error: error });
    });
});

app.post("/messages", (req, res) => {
  const message = req.body;
console.log(message);
  if (!message) {
      return res.status(400).json({ error: "Messaggio richiesto" });
  }
  const contenuto = message.contenuto;
  const nomeArtista = message.nomeArtista;
  const idChat = message.idChat;
  const data = message.data;

 
  if( insertMessaggio(contenuto, nomeArtista, idChat, data)){
    res.json({ message: "Messaggio inserito correttamente" });
  }else{
    res.status(500).json({ error: error });
  }
});

app.post("/saveMessage", (req, res) => {
  console.log(JSON.stringify(req.body));

  // Ottieni il timestamp corrente e convertilo al fuso orario italiano
  const timestamp = moment().tz('Europe/Rome').format('YYYY-MM-DD HH:mm:ss');


  if( insertMessaggio(req.body.message.contenuto, req.body.message.nomeArtista, req.body.message.idChat, timestamp)){
    res.json({ message: "Messaggio inserito correttamente" });
  }else{
    res.status(500).json({ error: error });
  }

});


app.post("/insertAudio", (req, res) => {
  const path=req.body.path;
  const idProgetto=req.body.idProgetto;
  if (!path || !idProgetto) {
    return res.status(400).json({ error: "Path e idProgetto sono richiesti" });
  }
deleteAudioByIdProgetto(idProgetto).then(result=>{
  if(result){
    insertAudio(path, idProgetto)
    .then(() => {
      res.json({ message: "Audio inserito correttamente" });
    })
    .catch((error) => {
      res.status(500).json({ error: error });
    });
  }else{
    res.status(500).json({ error: error });
  }
})
 
});

app.post("/selectAudio", (req, res) => {
  const idProgetto = req.body.idProgetto;
  
  if (!idProgetto) {
    return res.status(400).json({ error: "idProgetto è richiesto" });
  }

  selectAudio(idProgetto)
    .then((result) => {
      res.json(result);
    })
    .catch((error) => {
      res.status(500).json({ error: error });
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
  console.log(req.body);
  insertPartecipazione(nomeArtista, idProgetto)
    .then(() => {
      res.json({ message: "Partecipazione inserita correttamente" });
    })
    .catch((error) => {
      res.status(500).json({ error: error });
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
      res.status(500).json({ error: error });
    });
});

app.delete("/user/:nome", (req, res) => {
  const nome = req.params.nome;
  deleteUtente(nome)
    .then(() => {
      res.json({ message: "Utente eliminato correttamente" });
    })
    .catch((error) => {
      res.status(500).json({ error: error });
    });
});

app.delete("/project/:id", (req, res) => {
  const id = req.params.id;
  deleteProgetto(id)
    .then(() => {
      res.json({ message: "Progetto eliminato correttamente" });
    })
    .catch((error) => {
      res.status(500).json({ error: error });
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
      res.status(500).json({ error: error });
    });
});

app.delete("/chat/:id", (req, res) => {
  const id = req.params.id;
  deleteChat(id)
    .then(() => {
      res.json({ message: "Chat eliminata correttamente" });
    })
    .catch((error) => {
      res.status(500).json({ error: error });
    });
});

app.delete("/message/:id", (req, res) => {
  const id = req.params.id;
  deleteMessaggio(id)
    .then(() => {
      res.json({ message: "Messaggio eliminato correttamente" });
    })
    .catch((error) => {
      res.status(500).json({ error: error });
    });
});

app.delete("/text/:id", (req, res) => {
  const id = req.params.id;
  deleteTestoById(id)
    .then(() => {
      res.json({ message: "Testo eliminato correttamente" });
    })
    .catch((error) => {
      res.status(500).json({ error: error });
    });
});








server.listen(5100, () => {
  console.log("- server running");
});
