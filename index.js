const express = require('express')
const app = express()
const path = require('path')
const morgan = require('morgan')
const MongoClient = require('mongodb').MongoClient
const objectId = require('mongodb').ObjectId
const product = require('./src/models/product')
const router = require('./src/route/web')
const methodOverride = require('method-override')
const sortMiddlewares = require('./src/middlewares/sortMiddlewares')


app.set('views', path.join(__dirname, 'src/views'))
app.set("view engine", "ejs");
app.use(morgan('combined'));
app.use(express.static('public'));
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(methodOverride('_method'))
app.use('/public', express.static('public'))
app.use(sortMiddlewares)
// app.use('/', router)


//funtion helper engine
//column type sort
app.locals.sortable = (field, sort) => {
    const sortType = field === sort.column ? sort.type : 'default'

    const icons = {
        default: 'oi oi-elevator',
        asc: 'oi oi-sort-ascending',
        desc: 'oi oi-sort-descending',
    };
    const types = {
        default: 'desc',
        asc: 'desc',
        desc: 'asc',
    };
    const icon = icons[sortType]
    const type = types[sortType]
    return `<a href="/products/sort?_sort&column=${field}&type=${type}">
    <span class="${icon}"></span>
    </a>`
}

app.get('/', (req, res) => {
    res.render('header')
})

app.get('/creates', (req, res) => {
    res.render('create.ejs')
})

const port = 3000;

MongoClient.connect('mongodb://localhost:27017', { useUnifiedTopology: true })
    .then(client => {
        console.log('Connected to Database')
        const db = client.db('tomaho-test')

        //port app
        app.listen(port, () => {
            console.log(`App listening on port ${port}`)
        })

        //get product
        app.get('/products', (req, res) => {
            const data = db.collection("tomaho")
            data.find().toArray()
                .then(results => {
                    res.render('product.ejs', { products: results })
                })
                .catch(error => console.error(error))
        })

        app.get('/products/sort', (req, res) => {
            const data = db.collection("tomaho")
            //sort product
            if (req.query.hasOwnProperty('_sort')) {
                let type;
                const extype = req.query.type

                if (extype == 'asc') {
                    type = 1
                } else {
                    type = -1
                }

                const mysort =
                {
                    [req.query.column]: type
                }

                data.find().sort(mysort).toArray()
                    .then(results => {
                        res.render('product.ejs', { products: results })
                    })
                    .catch(error => console.error(error))
            }

        })

        //update dislay data edit
        app.get('/products/:id/edit', (req, res) => {
            const id = req.params.id
            db.collection('tomaho').findOne({ '_id': objectId(id) })
                .then(results => {
                    res.render('edit.ejs', { product: results })
                })
                .catch(error => console.error(error))
        })

        //update
        app.put('/products/:id', (req, res) => {
            const id = req.params.id
            const item = {
                name: req.body.name,
                description: req.body.description,
                price: req.body.price,
            }
            db.collection("tomaho").updateOne({ '_id': objectId(id) }, { $set: item }, function (err, res) {
                if (err) throw err;
                console.log("1 document updated");
            });
            res.redirect('/products')
        })

        //create product
        app.post('/creates', (req, res) => {
            const data = req.body
            console.log(data)
            db.collection('tomaho').insertOne(data, function (err, res) {
                //neu xay ra loi
                if (err) throw err;
                //neu khong co loi
                console.log('Them thanh cong');
            });
            res.redirect('back')
        });

        //delete
        app.delete('/products/:id', (req, res) => {
            const id = req.params.id
            db.collection("tomaho").deleteOne({ '_id': objectId(id) }, function (err, obj) {
                console.log('>>>>>>>>>>>>', objectId(id))
                if (err) throw err;
                console.log("1 document deleted");
                res.redirect('back')
            });
        });

        //pagination
        app.get('/pagination/:page', (req, res, next) => {
            let perPage = 2;
            let page = req.params.page || 1;
            const Product = db.collection("tomaho")
            Product
                .find()
                .skip((perPage * page) - perPage)
                .limit(perPage)
                .toArray((err, results) => {
                    Product.countDocuments((err, count) => {
                        if (err) return next(err);
                        res.render('pagination.ejs', {
                            products: results,
                            current: page,
                            pages: Math.ceil(count / perPage)
                        });
                    })
                })
        })

    })
    .catch(error => console.error(error))


