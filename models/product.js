const mongodb = require('mongodb');
const getDb = require('../util/database').getDb;
class Product {
    constructor(title, price, description, imageUrl)  {
        this.title = title;
        this.imageUrl = imageUrl,
        this.description = description,
        this.price = price
    }
    save() {
        const db = getDb();
        return db.collection('products')
        .insertOne(this)
        .then(result => {
            console.log(result)
        })
        .catch(err => {
            console.log(err);
        })
    }
    static fetchAll() {
        const db = getDb();
        return db
            .collection('products')
            .find()
            .toArray()
            .then(products => {
                console.log(products)
                return products;
            })
            .catch(err => {
                console.log(err)
            })
    }
    
    static findById(prodId) {
        const db =  getDb();
        return db
            .collection('products')
            .find({_id: new mongodb.ObjectID(prodId)})
            .next()
            .then(product => {
                console.log(product)
                return product;
            })
            .catch(err => {
                console.log(err)
            })
    }
}
// const fs = require('fs');
// const path = require('path');

// const Cart = require('../models/cart');

// const p = path.join(
//     path.dirname(process.mainModule.filename),
//     'data',
//     'products.json'
// );
// const getProductsFromFile = (cb) => {

//     fs.readFile(p, (err, fileContent) => {
//         if (err) {
//             cb([])
//         } else {
//             return cb(JSON.parse(fileContent));
//         }
//     })
// }

// module.exports = class Product {
//     constructor(id, title, imageUrl, description, price) {
//         this.id = id;
//         this.title = title;
//         this.imageUrl = imageUrl,
//         this.description = description,
//         this.price = price
//     }
//     save() {
//         getProductsFromFile(products => {
//             // this refers to the class because we are using the arrow function
//             if (this.id) {
//                 console.log(this)
//                 const existingProductIndex = products.findIndex(prod => prod.id === this.id);
//                 const updatedProducts = [...products];

//                 updatedProducts[existingProductIndex] = this;
//                 fs.writeFile(p, JSON.stringify(updatedProducts), (err) => {
//                     console.log(err)
//                 });
//             } else {
//                 this.id = Math.random().toString();

//                 products.push(this);
//                 fs.writeFile(p, JSON.stringify(products), (err) => {
//                     console.log(err)
//                 });
//             }

//         });
//     }
//     static deleteById(id) {
//         getProductsFromFile(products => {
//             const product = products.find(prod => prod.id === id);
//             const updatedProducts = products.filter(prod => prod.id !== id);
//             fs.writeFile(p, JSON.stringify(updatedProducts), err => {
//                 if (!err) {
//                     Cart.deleteProduct(id, product.price)
//                 }
//             });
//         })
//     }
//     static fetchAll(cb) {
//         getProductsFromFile(cb);
//     }
//     static findById(id, cb) {
//         getProductsFromFile(products => {
//             const product = products.find(p => p.id === id);
//             cb(product);
//         })
//     }
// }

module.exports = Product;