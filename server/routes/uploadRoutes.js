const express = require('express');
const router = express.Router();
const multer = require('multer');
const dataController = require('../controllers/dataController');

// Configure Multer
const upload = multer({ dest: 'uploads/' });

router.post('/', upload.single('file'), dataController.uploadFile);

module.exports = router;
