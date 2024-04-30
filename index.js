const express = require('express');
const path = require('path');

const app = express();
const port = 3000;

// Middleware per servire file statici da 'public'
app.use(express.static('public'));

// Route principale che serve la pagina HTML
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '/public/index.html'));
});



// Avvio del server
app.listen(port, () => {
  console.log(`Server in ascolto su http://localhost:${port}`);
});
