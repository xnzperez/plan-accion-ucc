const multer = require('multer');
const path = require('path');
const fs = require('fs'); // Importar fs para crear el directorio si no existe

// Configuración de almacenamiento
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // --- CORRECCIÓN DEFINITIVA ---
    // __dirname es backend/src/middleware
    // '../..' sube dos niveles hasta backend/
    // 'uploads' entra en la carpeta uploads
    const uploadPath = path.resolve(__dirname, '..', '..', 'uploads');

    // Asegurarse de que el directorio exista
    fs.mkdirSync(uploadPath, { recursive: true });

    console.log('Multer saving to absolute path:', uploadPath); // Log para depurar
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // Nombre de archivo único
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

module.exports = upload;