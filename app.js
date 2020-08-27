const express = require('express');
const path = require('path');
const graphqlHttp = require('express-graphql');
const { graphqlUploadExpress } = require('graphql-upload');
const mongoose = require('mongoose');
const graphqlSchema = require('./graphql/schema');
const jwt = require('jsonwebtoken');
const config = require('./backend-config/config.js');
const morgan = require('morgan');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', "*");
    res.setHeader('Access-Control-Allow-Methods', 'POST,GET,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if(req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});
app.use(express.urlencoded({ extended: false })); 
app.use("/images", express.static(path.join("backend/images")));

if(process.env.NODE_ENV === 'development') {   
    app.use(morgan ('dev'));
}

app.use('/graphql', 
    graphqlUploadExpress({ maxFileSize: 10000000, maxFiles: 10 }),
    graphqlHttp((req, res, graphQLParams) => {    
        console.log(req.headers)       
            if(req.headers.authorization && req.headers.authorization.split(' ')[1].length > 10) {
                const token = req.headers.authorization.split(' ')[1];
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                req.user = decoded;
            } 
            const host = app.get('env') === 'development' ? 'localhost:3000' : req.get('host');
            const imagePath = req.protocol + '://' + host + '/images/';
            
            return {
                schema: graphqlSchema,
                graphiql: app.get('env') === 'development',
                context: {
                    req: req,
                    user: req.user,
                    host: host,
                    imagePath: imagePath
                }
            }
}));

mongoose.connect(`mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASS}@cluster0-q2cpb.mongodb.net/${process.env.MONGO_DB}?retryWrites=true&w=majority`,
                    { useNewUrlParser: true, 
                    useCreateIndex: true, 
                    useUnifiedTopology: true,
                    useFindAndModify: false })
                .then(() => {
                        app.listen(port, () => {
                        console.log(`Server is listening on ${port}`);
                    })            
                })
                .catch((err) => {
                    console.log('db error', err);
                    process.exit(1);
                }) 

// const distDir = __dirname + "/dist/";
// app.use(express.static(distDir));

if(process.env.NODE_ENV === 'production') {
    const distDir = __dirname + "/dist/";
    app.use(express.static(distDir));
    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, 'dist', 'client', 'index.html'));
    })
}
