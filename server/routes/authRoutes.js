const express = require('express')
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const { registerUser, loginUser, getUserinfo } = require('../controllers/authController');
const upload = require('../middlewares/uploadMiddlewares');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/getuser', protect, getUserinfo);

router.post("/upload-image",upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }
    const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

    res.status(200).json({ message: 'File uploaded successfully', imageUrl });
});

module.exports = router;