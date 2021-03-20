const path = require('path');

const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin');


const isAuth = require('../middleware/is-auth');
const { body } = require('express-validator/check');

const multer = require('multer');
const multerS3 = require('multer-s3');
const aws = require('aws-sdk');

aws.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
});
const s3 = new aws.S3();
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(null, false);
    }
};

router.get('/add-product', isAuth, adminController.getAddProduct);

router.get('/products', isAuth, adminController.getProducts)

router.post(
    '/add-product',
    [
        body('title')
        .isString()
        .isLength({
            min: 3
        })
        .trim(),
        body('price').isFloat(),
        body('description').isLength({
            min: 5,
            max: 400
        }).trim()
    ],
    isAuth,
    multer({
        storage: multerS3({
            s3: s3,
            bucket: process.env.AWS_BUCKET_NAME,
            key: function(req, file, cb) {
                cb(null, new Date().toISOString() + '-' + file.originalname);
            }
        }),
        fileFilter: fileFilter,
        limits: { fileSize: 4 * 1024 * 1024 }
    }).single('image'),
    adminController.postAddProduct
);

router.get('/edit-product/:productId', isAuth, adminController.getEditProduct)
router.post('/edit-product', 
// TODO: figure out why validation breaks editing
// [
//     body('title')
//     .isString()
//     .isLength({
//         min: 3
//     })
//     .trim(),
//     body('price').isFloat(),
//     body('description').isLength({
//         min: 5,
//         max: 400
//     }).trim()
// ],
isAuth,
multer({
    storage: multerS3({
        s3: s3,
        bucket: process.env.AWS_BUCKET_NAME,
        key: function(req, file, cb) {
            cb(null, new Date().toISOString() + '-' + file.originalname);
        },
    }),
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024}
}).single('image'),
adminController.postEditProduct);

router.put(
    '/:id',
    [
        body('title')
        .isString()
        .isLength({
            min: 3
        })
        .trim(),
        body('price').isFloat(),
        body('description').isLength({
            min: 5,
            max: 400
        }).trim()
    ],
    isAuth,
    multer({
        storage: multerS3({
            s3: s3,
            bucket: process.env.AWS_BUCKET_NAME,
            key: function(req, file, cb) {
                cb(null, new Date().toISOString() + '-' + file.originalname);
            },
        }),
        fileFilter: fileFilter,
        limits: { fileSize: 5 * 1024 * 1024}
    }).single('image'),
    
    adminController.editProduct

)

router.delete('/product/:productId', isAuth, adminController.deleteProduct)

module.exports = router;