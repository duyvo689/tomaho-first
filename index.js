const express = require('express')
const app = express()
const path = require('path')
const morgan = require('morgan')
const MongoClient = require('mongodb').MongoClient
const objectId = require('mongodb').ObjectId
const bodyParser = require('body-parser')
const course = require('./src/models/courses')
const { ObjectId } = require('mongodb')
const router = require('./src/route/web')
const methodOverride = require('method-override')


app.set('views', path.join(__dirname, 'src/views'))
app.set("view engine", "ejs");
app.use(morgan('combined'));
app.use(express.static('public'));
app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded
app.use(methodOverride('_method'))
// app.use('/', router)


// app.get('/', (req, res) => {
//     res.sendFile(path.join(__dirname, 'views/form.html'))
// })
app.get('/', (req, res) => {
    res.render('header')
})

app.get('/creates', (req, res) => {
    res.render('create.ejs')
})

// app.get('/update', (req, res) => {
//     res.render('update.ejs')
//     console.log('>>>>>>>>>>>>>>>>>.', req.params)
//     res.send(req.params)
// })




const port = 3000;

MongoClient.connect('mongodb://localhost:27017', { useUnifiedTopology: true })
    .then(client => {
        console.log('Connected to Database')
        const db = client.db('tomaho-test')
        // const tomahoCollection = db.collection('tomaho')

        //port app
        app.listen(port, () => {
            console.log(`App listening on port ${port}`)
        })

        //get course
        app.get('/courses', (req, res) => {
            db.collection('tomaho').find().toArray()
                .then(results => {
                    res.render('course.ejs', { courses: results })
                })
                .catch(error => console.error(error))
        })
        //update dislay data edit
        app.get('/courses/:id/edit', (req, res) => {
            const id = req.params.id
            db.collection('tomaho').findOne({ '_id': objectId(id) })
                .then(results => {
                    res.render('edit.ejs', { course: results })
                })
                .catch(error => console.error(error))
            // const item = {
            //     name: req.body.name,
            //     description: req.body.description,
            // }

            // db.collection("tomaho").updateOne({ '_id': objectId(id) }, { $set: item }, function (err, res) {
            //     if (err) throw err;
            //     console.log("1 document updated");
            // });
        })
        //update
        app.put('/courses/:id', (req, res) => {
            const id = req.params.id
            const item = {
                name: req.body.name,
                description: req.body.description,
            }
            db.collection("tomaho").updateOne({ '_id': objectId(id) }, { $set: item }, function (err, res) {
                if (err) throw err;
                console.log("1 document updated");
            });
            res.redirect('/courses')
        })

        //create course
        app.post('/creates', (req, res) => {
            const data = req.body
            console.log(data)
            db.collection('tomaho').insertOne(data, function (err, res) {
                //neu xay ra loi
                if (err) throw err;
                //neu khong co loi
                console.log('Them thanh cong');
            });
            res.redirect('/courses')
        });

        //delete
        app.delete('/courss/:id', (req, res) => {
            db.collection("tomaho").deleteOne({ '_id': objectId(id) }, function (err, obj) {
                if (err) throw err;
                console.log("1 document deleted");
                res.redirect('/courses')
            });
            // backURL = req.header('Referer') || '/';
        });


    })
    .catch(error => console.error(error))


