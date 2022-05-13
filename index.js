import http from "http";
import express from "express";
import logger from "morgan";
import bodyParser from "body-parser";
import axios from "axios";
import { generateToken , validateToken } from "./auth";

const hostname = "localhost";
const port = 8088;
const app = express(); // setup express application
const server = http.createServer(app);

app.use(logger("dev")); // log requests to the console

// Parse incoming requests data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

const configGet = {
  headers: {
    Authorization:
      "api-key 14:2022-05-12:anna.vanduijvenbode@1337.tech 2a2d474eb4e4a2b4d89592ae467d7804c68eb40bc8a06e3debcc3eed2eb12095",
  },
};

/**
 *  Function is used for login
 *
 * @param {Object} req
 * @param {Object} res
 * @returns {Promise<Object[]>}
 * @url : http://localhost:8088/api/login
 */

app.post("/api/login", (req, res) => {
    if(req.body.username == "" || req.body.password == ""){
        res.status(500).send({ message: 'Invalid' })
    }else{
        const jwtToken = generateToken(req.body);
        res.status(200).send({ username : req.body.username, jwtToken })
    }
});

/**
 *  Function is used get all coworkers and also work with start and end index
 *
 * @param {Object} req
 * @param {Object} res
 * @returns {Promise<Object[]>}
 * @url : http://localhost:8088/api/coworkers
 * @url : http://localhost:8088/api/coworkers?start=50&end=100
 * @url : http://localhost:8088/api/coworkers?filter=anna
 */

app.get("/api/coworkers", (req, res) => {
    const verified = validateToken(req.headers.authorization && req.headers.authorization.split(' ')[1]);
    if(verified){
        let startIndex = req.query.start;
        let endIndex = req.query.end;
        let filter = req.query.filter;
        axios.get("https://api.1337co.de/v3/employees", configGet).then(({ data }) => {
            if(startIndex && endIndex){
                res.status(200).send({ 
                    startIndex: parseInt(startIndex),  
                    endIndex : parseInt(endIndex), 
                    data: data.slice(parseInt(startIndex),  parseInt(endIndex)), 
                    totalLength: data.length })
            }else if(filter && filter.length > 0){
                let filteredArr = data.filter(x => x.name.toLowerCase().includes(filter.toLowerCase()))
                res.status(200).send({ data : filteredArr, totalLength: filteredArr.length, filteredText : filter  })
            }else{
                res.status(200).send({ data, totalLength: data.length })
            }
        });
    }else{
        res.status(500).send({ message: 'Invalid token' })
    }
});

/**
 *  Function is used to get individual co worker 
 *
 * @param {Object} req
 * @param {Object} res
 * @returns {Promise<Object[]>}
 * @url : http://localhost:8088/api/coworker/Ahmad%20Mirzaei
 */

app.get("/api/coworker/:name", (req, res) => {
    const verified = validateToken(req.headers.authorization.split(' ')[1]);
    if(verified){
        axios.get("https://api.1337co.de/v3/employees", configGet).then(({ data }) => {
            res.status(200).send({
                data : data.filter((each) => each.name.toLowercase() == req.params.name.toLowercase())})
            });
    }else{
        res.status(500).send({ message: 'Invalid token' })
    }
});

app.use('*', (req, res) => {
	res.status(200).send({ message : 'No end point configured!, please check the request' })
});


server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
