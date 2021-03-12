const { validationResult } = require('express-validator/check');

const Product = require('../models/product');

const aws = require('aws-sdk');
aws.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
});
const s3 = new aws.S3();

exports.getAddProduct = (req, res, next) => {
    res.render('admin/edit-product', {
        pageTitle: 'Add Product',
        path: '/admin/add-product',
        editing: false,
        hasError: false,
        errorMessage: null,
        validationErrors: []
    });
}

exports.postAddProduct = async(req, res, next) => {
    const { title, price, description } = req.body;
    const errors = validationResult(req);
    const image = req.file;
    if (!image) {
        //TODO: change to render change frontend to react
        return res.status(422).render('admin/edit-product', {
            pageTitle: 'Edit Product',
            path: '/admin/add-product',
            editing: false,
            hasError: true,
            product: {
                title: title,
                imageUrl: image.location,
                price: price,
                description: description,
            },
            errorMessage: errors.array()[0].msg,
            validationErrors: errors.array()
        });;
    }
    try {
        const product = new Product({
            title: title,
            imageUrl: image.location,
            price: price,
            description: description,
            userId: req.user
        });
        const newProduct = await product.save();
        console.log(newProduct);
        res.redirect('/admin/products')
    } catch(err) {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    }
}

exports.getEditProduct = (req, res, next) => {
    const editMode = req.query.edit;
    if (!editMode) {
        return res.redirect('/');
    }
    const prodId = req.params.productId;
    Product.findById(prodId)
        .then(product => {
            if (!product) {
                return res.redirect('/')
            }
            res.render('admin/edit-product', {
                pageTitle: 'Edit Product',
                path: '/admin/edit-product',
                editing: editMode,
                hasError: false,
                product: product,
                errorMessage: null,
                validationErrors: []
            });
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        })
}

exports.postEditProduct = async(req, res, next) => {
    const { productId, title, price, description } = req.body
    const image = req.file;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).render('admin/edit-product', {
            pageTitle: 'Edit Product',
            path: '/admin/edit-product',
            editing: true,
            hasError: true,
            product: {
                title: title,
                imageUrl: image.location,
                price: price,
                description: description,
                _id: productId
            },
            errorMessage: errors.array()[0].msg,
            validationErrors: errors.array()
        });
    }
    try {
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ msg: 'product not found'}); 
        }
        if (product.userId.toString() !== req.user._id.toString()) {
            return res.redirect('/');
        }
        product.title = title;
        product.price = price;
        product.description = description;
        const updatedProduct = await product.save();
        if (image) {
            let key = product.imageUrl.split('/').pop();
            let params = {Bucket: process.env.AWS_BUCKET_NAME, Key: key}
            s3.deleteObject(params, (err, data) => {
                if (err) console.log(err, err.stack);
                else console.log('deleted');
            });
        }
        res.redirect('/admin/products');
    } catch(err) {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    }
};

exports.getProducts = async(req, res, next) => {
    try {
        const products = await Product.find({ userId: req.user._id });
        if (products) {
            res.render('admin/products', {
                prods: products,
                pageTitle: 'Admin Products',
                path: '/admin/products'
            });
        }
    } catch (err) {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    }
}

exports.postDeleteProduct = async(req, res, next) => {
    const { productId } = req.body;
    try {
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ msg: 'error deleting page not found'});
        }
        let key = product.imageUrl.split('/').pop();
        let params = {Bucket: process.env.AWS_BUCKET_NAME, Key: key}
        s3.deleteObject(params, (err, data) => {
            if (err) console.log(err, err.stack);
            else console.log('deleted');
        });
        await Product.deleteOne({
            _id: productId,
            userId: req.user._id
        });
        console.log('Deleted Product');
        res.redirect('/admin/products')
    } catch(err) {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    }
}