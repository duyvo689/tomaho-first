const express = require('express')
const app = express()
const path = require('path')
const morgan = require('morgan')
const MongoClient = require('mongodb').MongoClient
const bodyParser = require('body-parser')
const course = require('./src/models/courses')


app.set('views', path.join(__dirname, 'src/views'))
app.set("view engine", "ejs");
app.use(morgan('combined'));
app.use(express.static('public'));
app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded


// app.get('/', (req, res) => {
//     res.sendFile(path.join(__dirname, 'views/form.html'))
// })

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
        // const tomahoCollection = db.collection('tomaho')

        //port app
        app.listen(port, () => {
            console.log(`App listening on port ${port}`)
        })

        //get course
        app.get('/courses', (req, res) => {
            db.collection('tomaho').find().toArray()
                .then(results => {
                    res.render('course.ejs', { course: results })
                    console.log(results)
                })
                .catch(error => console.error(error))
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

        // update course

        // db.collection("tomaho").updateOne(myquery, newvalues, function (err, res) {
        //     if (err) throw err;
        //     console.log("1 document updated");
        //     db.close();
        // });

    })
    .catch(error => console.error(error))


