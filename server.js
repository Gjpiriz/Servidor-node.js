const express = require('express');
const axios = require('axios');
const app = express();
const PORT = 3000;

app.use(express.json());

// Mockaroo URLs
const urls = {
  libros: "https://api.mockaroo.com/api/df229db0?count=10&key=82342750",
  autores: "https://api.mockaroo.com/api/16fb55d0?count=5&key=82342750",
  usuarios: "https://api.mockaroo.com/api/5925acf0?count=10&key=82342750",
  prestamos: "https://api.mockaroo.com/api/ba6ac050?count=5&key=82342750",
};

// Almacenamiento de datos en memoria para demostración.
const data = {
  libros: [],
  autores: [],
  usuarios: [],
  prestamos: [],
};

// Obtener datos de Mockaroo e inicializar datos en memoria
const initializeData = async () => {
  try {
    await Promise.all(Object.keys(urls).map(async (key) => {
      const response = await axios.get(urls[key]);
      data[key] = response.data;
      console.log(`Datos de ${key} cargados correctamente.`);
    }));
  } catch (error) {
    console.error('Error fetching data from Mockaroo:', error);
  }
}

// Inicializar datos y luego iniciar el servidor
initializeData().then(() => {
  const createCrudHandlers = (entity, idField = 'id') => {
    app.route(`/${entity}`)
      .get((req, res) => res.json(data[entity]))
      .post((req, res) => {
        const newItem = { ...req.body, [idField]: data[entity].length ? data[entity][data[entity].length - 1][idField] + 1 : 1 };
        data[entity].push(newItem);
        res.status(201).json(newItem);
      });

    app.route(`/${entity}/:${idField}`)
      .put((req, res) => {
        const itemId = parseInt(req.params[idField], 10);
        const itemIndex = data[entity].findIndex(item => item[idField] === itemId);
        if (itemIndex !== -1) {
          data[entity][itemIndex] = { ...data[entity][itemIndex], ...req.body };
          res.json(data[entity][itemIndex]);
        } else {
          res.status(404).send({ message: `${entity.slice(0, -1)} no encontrado` });
        }
      })
      .delete((req, res) => {
        const itemId = parseInt(req.params[idField], 10);
        const itemIndex = data[entity].findIndex(item => item[idField] === itemId);
        if (itemIndex !== -1) {
          const deletedItem = data[entity].splice(itemIndex, 1);
          res.json(deletedItem[0]);
        } else {
          res.status(404).send({ message: `${entity.slice(0, -1)} no encontrado` });
        }
      });
  };

  // Crear rutas CRUD para cada entidad, especificando el campo de ID para libros
  createCrudHandlers('libros', 'id_libro');
  createCrudHandlers('autores');
  createCrudHandlers('usuarios');
  createCrudHandlers('prestamos');

  // Ruta de prueba
  app.get('/', (req, res) => {
    res.send('Servidor funcionando correctamente');
  });

  // Manejo de errores
  app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
  });

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}).catch(error => {
  console.error('Error during data initialization:', error);
});









