/*********************************************************************************
* WEB322 – Assignment 03
* I declare that this assignment is my own work in accordance with Seneca Academic Policy. No part
* of this assignment has been copied manually or electronically from any other source
* (including 3rd party web sites) or distributed to other students.
*
* Name: _Mahrokh Sadrolodabaee______ Student ID: __159436195_____ Date: __July 17,2021_____
*
* Online (Heroku) Link: https://web322-asg3.herokuapp.com/
*
********************************************************************************/

const express = require("express");
const exphbs = require('express-handlebars');
const path = require("path");
const data = require("./data-service.js");
const bodyParser = require('body-parser');
const fs = require("fs");
const multer = require("multer");
const { resolve } = require("path");
const { rejects } = require("assert");
const app = express();
app.engine('.hbs', exphbs({
    extname: '.hbs',

    helpers: {
        //or helper1
        navLink: function (url, options) {
            return '<li' +
                ((url == app.locals.activeRoute) ? ' class="active" ' : '') +
                '><a href="' + url + '">' + options.fn(this) + '</a></li>';
        },
        equal: function (lvalue, rvalue, options) {
            if (arguments.length < 3)
                throw new Error("Handlebars Helper equal needs 2 parameters");
            if (lvalue != rvalue) return options.inverse(this);
            else return options.fn(this);

        }


    }




}));




app.set('view engine', '.hbs');
app.use(express.static("public"));

const HTTP_PORT = process.env.PORT || 8080;

// multer requires a few options to be setup to store files with file extensions
// by default it won't store extensions for security reasons
const storage = multer.diskStorage({
    destination: "./public/images/uploaded",
    filename: function (req, file, cb) {
        // we write the filename as the current date down to the millisecond
        // in a large web service this would possibly cause a problem if two people
        // uploaded an image at the exact same time. A better way would be to use GUID's for filenames.
        // this is a simple example.
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

// tell multer to use the diskStorage function for naming files instead of the default.
const upload = multer({ storage: storage });


app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));


app.use(function (req, res, next) {
    let route = req.baseUrl + req.path;
    app.locals.activeRoute = (route == "/") ? "/" : route.replace(/\/$/, "");
    next();
});





app.post("/department/update", (req, res) => {
    data.updateDepartment(req.body)
        .then(() => {
            res.redirect('/')
        });
});

app.post("/departments/add", (req, res) => {
    data.addDepartment(req.body) //how does it know req body name,name?
        .then(() => {
            res.redirect('/departments');
        });
});


app.post("/employee/update", (req, res) => {

    data.updateEmployee(req.body)
        .then(res.redirect('/employees'))
});

app.post("/employees/add", (req, res) => {
    data.addEmployee(req.body)
        .then(() => {
            res.redirect("/employees");
        });
});

app.post("/images/add", upload.single("imageFile"), (req, res) => {
    res.redirect("/images");
});



app.get("/", (req, res) => {
    res.render('home');
});

app.get("/about", (req, res) => {
    //res.sendFile(path.join(__dirname, "/views/about.hbs"));
    res.render('about');
});

app.get("/images/add", (req, res) => {
    res.render('addImage');
});

app.get("/employees/add", (req, res) => {
    res.render('addEmployee');
});
//whers array of images???
app.get("/images", (req, res) => {
    fs.readdir("./public/images/uploaded", function (err, items) {
        res.render("images", { images: items });
    });
});

app.get("/employees", (req, res) => {
    if (req.query.status) {
        data.getEmployeesByStatus(req.query.status).then((data) => {

            res.render("employees", { employees: data })

        }).catch((err) => {
            res.render("employees", { message: "no results" });
        });
    } else if (req.query.department) {
        data.getEmployeesByDepartment(req.query.department).then((data) => {

            res.render("employees", { employees: data })

        }).catch((err) => {
            res.render("employees", { message: "no results" });
        });
    } else if (req.query.manager) {
        data.getEmployeesByManager(req.query.manager).then((data) => {

            //  if(data.length>0) 
            res.render("employees", { employees: data })
            //  else res.render("employees",{message:"no results"})

        }).catch((err) => {
            res.render("employees", { message: "no results" });
        });
    } else {
        data.getAllEmployees().then((data) => {//we need to use  if(data.length>0) just here?

            if (data.length > 0) res.render("employees", { employees: data })
            else res.render("employees", { message: "no results" })

        }).catch((err) => {
            res.render("employees", { message: "no results" });
        });
    }
});



app.get("/employee/:empNum", (req, res) => {
    data.getEmployeeByNum(req.params.empNum)
        .then((data) => {
            res.render("employee", { employee: data });
        }).catch((err) => {
            res.render("employee", { message: "no results" }); //whers this msg?
        });
});



app.get("/managers", (req, res) => {
    data.getManagers().then((data) => {
        res.render("employees", { employees: data })
    });
});

app.get("/departments", (req, res) => {
    data.getDepartments().then((data) => {

        if (data.length > 0) res.render("departments", { departments: data });
        else res.render("employees", { message: "no results" });
    });
});

app.get("/departments/add", (req, res) => {
    data.addDepartment(req, body)
        .then(() => {
            res.render("/departments");
        });
});


app.get("/department/:departmentId", (req, res) => {
    data.getDepartmentById(req, params, departmentId)
        .then(data => {
            if (data.lenngth > 0) resolve(data);
            else res.status(404).send('DepartmentNot Found');
        }).catch(err => res.status(404).send("DepartmentNot Found"));

});
/*
ThisGETroutewill invoke your newly created deleteDepartmentById(id)data-service method.  If the function
 resolved successfully, redirect the user to the "/departments"view.  If the operation encountered an error, 
 return a status code of 500and the plain text: "Unable to Remove Department/ Departmentnot found)"
*/
app.get("/departments/delete/:departmentId", (req, res) => {
    data.deleteDepartmentById(req, params.departmentId)//if else or catch???
        .then(data => {
            if (data.lenngth > 0) res.redirect('/departments');
            else res.status(500).send('Unable to Remove Department/ Departmentnot found');
        }).catch(err => res.status(500).send("Unable to Remove Department/ Departmentnot found"));
});



app.use((req, res) => {
    res.status(404).send("Page Not Found");
});

data.initialize().then(function () {
    app.listen(HTTP_PORT, function () {
        console.log("app listening on: " + HTTP_PORT)
    });
}).catch(function (err) {
    console.log("unable to start server: " + err);
});




//check the db i need to connect to a dif repo i think

