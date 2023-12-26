// loads several packages
const express = require('express');
const { engine } = require('express-handlebars');
const sqlite3 = require('sqlite3')
const port = 8080 // defines the port
const app = express();// creates the Express app 
const bodyParser = require('body-parser');
const session = require('express-session');
const connectSqlite3 = require('connect-sqlite3');
const bcrypt = require("bcrypt"); //loads bcrypt
//const cookieParser = require('cookie-parser');
const SQLiteStore = connectSqlite3(session);

app.use(express.static("public"));
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(
  session({
  store: new SQLiteStore({db: "session-bs.db"}),
  saveUninitialized: false,
  resave: false,
  secret: "lOStOBILLOSdEyOONbuM89amarilloamarillolospl4tan0$"
}));

app.post("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/");
});

// defines handlebars engine
app.engine('handlebars', engine());
// defines the view engine to be handlebars
app.set('view engine', 'handlebars');
// defines the views directory
app.set('views', './views');

app.get("/setname", (req, res) => {
  req.session.name = req.query.name;
  res.send("Session started");
});
app.get("/series", (req, res) => {
  db.all("SELECT * FROM series", (error, seriesData) => {
    if (error) {
      console.log("Error retrieving series data: ", error);
    } else {
      const model = {
        series: seriesData,
        isLoggedIn: req.session.isLoggedIn,
        name: req.session.name,
        isAdmin: req.session.isAdmin,
      };
      res.render("serie.handlebars", model);
    }
  });
});

//Adds new projects
app.get("/projects/new/", (req, res) => {
  if (req.session.isLoggedIn == true && req.session.isAdmin == true) {
    const model = {
      isLoggedIn: req.session.isLoggedIn,
      name: req.session.name,
      isAdmin: req.session.isAdmin,
    };
    res.render("newproject.handlebars", model);
  } else {
    res.redirect("/login");
  }
});

app.post("/projects/new/", (req, res) => {
  const np = [
    req.body.projname,
    req.body.projtype,
    req.body.projyear,
    req.body.projimg,
  ];
  if (req.session.isLoggedIn == true && req.session.isAdmin == true) {
    db.run(
      "INSERT INTO projects (pname, ptype, pyear, pimgURL) VALUES (?, ?, ?, ?)",
      np,
      (error) => {
        if (error) {
          console.log("ERROR: ", error);
        } else {
          console.log("Line added into the projects table!");
        }
        res.redirect("/projects");
      }
    );
  } else {
    res.redirect("/login");
  }
});

//sends the form to modify a project
app.get("/projects/update/:id", (req, res) => {
  const id = req.params.id;
  db.get(
    "SELECT * FROM projects WHERE pid=?",
    [id],
    function (error, theProject) {
      if (error) {
        console.log("ERROR: ", error);
        const model = {
          dbError: true,
          theError: error,
          project: {},
          isLoggedIn: req.session.isLoggedIn,
          name: req.session.name,
          isAdmin: req.session.isAdmin,
        };
        res.render("editProj.handlebars", model);
      } else {
        const model = {
          dbError: false,
          theError: "",
          project: theProject,
          isLoggedIn: req.session.isLoggedIn,
          name: req.session.name,
          isAdmin: req.session.isAdmin,
          helpers: {
            typePoster(value) {
              return value == "Poster";
            },
            typeUni(value) {
              return value == "University project";
            },
            typeArt (value) {
              return value == "Art Project"
            },
          },
        };
        res.render("editProj.handlebars", model);
      }
    }
  );
});

// modifies an existing project
app.post("/projects/update/:id", (req, res) => {
  const id = req.params.id;
  const np = [
    req.body.projname,
    req.body.projyear,
    req.body.projtype,
    req.body.projimg,
    id,
  ];
  if (req.session.isLoggedIn == true && req.session.isAdmin == true) {
    db.run(
      "UPDATE projects SET pname=?, pyear=?, ptype=?, pimgURL=? WHERE pid=?",
      np,
      (error) => {
        if (error) {
          console.log("ERROR: ", error);
        } else {
          console.log("Project updated!");
        }
        res.redirect("/projects");
      }
    );
  } else {
    res.redirect("/login");
  }
});

app.get("/projects/delete/:id", (req, res) => {
  const id = req.params.id;
  if (req.session.isLoggedIn == true && req.session.isAdmin == true) {
    db.run(
      "DELETE FROM projects WHERE pid=?",
      [id],
      function (error, theProjects) {
        if (error) {
          const model = {
            dbError: true,
            theError: error,
            isLoggedIn: req.session.isLoggedIn,
            name: req.session.name,
            isAdmin: req.session.isAdmin,
          };
          res.render("home.handlebars", model);
        } else {
          const model = {
            dbError: false,
            theError: "",
            isLoggedIn: req.session.isLoggedIn,
            name: req.session.name,
            isAdmin: req.session.isAdmin,
          };
          res.render("projects.handlebars", model);
          res.redirect("/projects");
        }
      }
    );
  } else {
    res.redirect("/login");
  }
});

// MODEL (DATA)
const db = new sqlite3.Database('isabel-data.db')

  // creates user table at startup
  db.run(
    "CREATE TABLE users (uid INTEGER PRIMARY KEY, username TEXT NOT NULL, password TEXT NOT NULL, hash TEXT NOT NULL, date INTEGER NOT NULL, isAdmin INTEGER NOT NULL)",
    (error) => {
      if (error) {
        console.error("ERROR: ", error);
      } else {
        console.log("---> Table users created!");
        const initialUsers = [
          {
            id: "0",
            username: "isabelita",
            password: "coromoto",
            hash: "coromoto",
            date:"1804",
            isAdmin: 1,
          },
          {
            id: "1",
            username: "pepe123",
            password: "lamancha",
            hash: "lamancha",
            date: "0810",
            isAdmin: 0,
          },
          {
            id: "2",
            username: "eleduardo",
            password: "pomposo",
            hash: "pomposo",
            date: "2203",
            isAdmin: 0,
          },
          {
            id: "3",
            username: "coca",
            password: "piscina",
            hash: "piscina",
            date: "1904",
            isAdmin: 0,
          },
          {
            id: "4",
            username: "gatinho",
            password: "lacontrasena",
            hash: "lacontrasena",
            date: "2708",
            isAdmin: 1,
          },
        ];
        initialUsers.forEach((user) => {
          const hash = bcrypt.hashSync(user.password, 10);
  
          db.run(
            "INSERT INTO users (uid, username, password, hash, date, isAdmin) VALUES (?, ?, ?, ?, ?, ?)",
            [
              user.id,
              user.username,
              user.password,
              hash,
              user.date,
              user.isAdmin,
            ],
            (error) => {
              if (error) {
                console.error("ERROR inserting user:", user.username, error);
              } else {
                console.log("User added to the users table:", user.username);
              }
            }
          );
        });
      }
    }
  );

//creates contact table at startup
  db.run(
    `
    CREATE TABLE contact (cid INTEGER PRIMARY KEY, cname TEXT NOT NULL, cemail TEXT NOT NULL, csubject TEXT NOT NULL, cmessage TEXT NOT NULL);
  `,
    (error) => {
      if (error) {
        console.log("ERROR: ", error);
      } else {
        console.log("---> Contact table created!");
      }
    }
  );
  
// creates table projects at startup
db.run("CREATE TABLE projects (pid INTEGER PRIMARY KEY, pname TEXT NOT NULL, ptype TEXT NOT NULL, pyear INTEGER NOT NULL, pimgURL TEXT NOT NULL)", (error) => {
    if (error) {
      // tests error: display error
      console.log("ERROR: ", error)
    } else {
      // tests error: no error, the table has been created
      console.log("---> Table projects created!")
  
      const projects=[
        {id :"0", 
        name :"Lamp poster", 
        type :"poster", 
        year: "2023",
        url:"/img/Lamp-poster.jpg" },

        { id:"1", 
        name:"Ichiko Aoba poster", 
        type:"Poster", 
        year: "2023",
        url:"/img/ichikoooo.jpg" },

        { id:"2", 
        name:"Lone Lynx", 
        type:"Visual Identity",
        year: "2022", 
        url:"/img/lone_lynx_branding.jpeg" },

        { id:"3", 
        name:"Jumping frog",
        type: "Game", 
        year: "2023",
        url:"/img/jumping-frog.png" },
        
        { id: "4",
          name: "Manga reading app",
          type: "Prototype",
          year: "2022",
          url: "/img/Manga-reading-app-prototype.jpeg"},

          { id: "5",
          name: "Vector-created Chopper",
          type: "A drawing of the One Piece character Tony Tony Chopper using vector graphics.",
          year: "2022",
          url: "/img/doctor_chopper.png"},


      ]
      // inserts projects
      projects.forEach( (oneProject) => {
        db.run("INSERT INTO projects (pid, pname, ptype, pyear, pimgURL) VALUES (?, ?, ?, ?, ?)", [oneProject.id, oneProject.name, oneProject.type, oneProject.year, oneProject.url], (error) => {
          if (error) {
            console.log("ERROR: ", error)
          } else {
            console.log("Line added into the projects table!")
          }
        })
      })
    }
  })
  
  // creates series at startup
  db.run(
    "CREATE TABLE series (sid INTEGER PRIMARY KEY, sname TEXT NOT NULL, stype TEXT NOT NULL, sdesc TEXT NOT NULL)",
    (error) => {
      if (error) {
        // tests error: display error
        console.log("ERROR: ", error);
      } else {
        // tests error: no error, the table has been created
        console.log("---> Table series created!");
        const series = [
          {
            id: "0",
            name: "Jojo's Bizarre Adventure",
            type: "Anime",
            desc: "The story of the Joestar bloodline.",
          },
          {
            id: "1",
            name: "Jujutsu Kaisen",
            type: "Anime",
            desc: "Sorcerers fight against curses.",
          },
          {
            id: "2",
            name: "One Piece",
            type: "Anime",
            desc: "Monkey D. Luffy wants to become the king of the pirates.",
          },
          {
            id: "3",
            name: "Dororo",
            type: "Anime",
            desc: "Kid was cursed when he was born and tries to undo it.",
          },
          {
            id: "4",
            name: "Bungo Stray Dogs",
            type: "Anime",
            desc: "Detective agency of people with super powers fighting evil.",
          },
          {
            id: "5",
            name: "Vinland Saga",
            type: "Anime",
            desc: "Kid who was a murderer seeks redemption by creating a land free of war.",
          },
        ];
        // inserts series
        series.forEach((oneSeries) => {
          db.run(
            "INSERT INTO series (sid, sname, stype, sdesc) VALUES (?, ?, ?, ?)",
            [oneSeries.id, oneSeries.name, oneSeries.type, oneSeries.desc],
            (error) => {
              if (error) {
                console.log("ERROR: ", error);
              } else {
                console.log("Line added into the series table!");
              }
            }
          );
        });
      }
    }
  );
  
app.get("/login", (req, res) => {
  const model = {
    isLoggedIn: req.session.isLoggedIn,
    name: req.session.name,
    isAdmin: req.session.isAdmin,
  };
  res.render("login.handlebars", model);
});

//login adapted from Linus Rudbeck's code shown in the lectures
app.post('/login', (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  db.get("SELECT * FROM users WHERE username = ?", [username], (err, user) => {
    if (err) {
      res.status(500).send({ error: "Server error" });
    } else if (!user) {
      console.log("User not found. Username:", username); // Debugging
      req.session.isLoggedIn = false;
      res.render("login.handlebars", { error: "User not found" });
    } else {
      console.log("Stored username:", user.username);
      console.log("Stored hashed password:", user.hash);
      const result = bcrypt.compareSync(password, user.hash);
      console.log("Password comparison result:", result); // Debugging

      if (result) {
        req.session.user = user;
        if (user.isAdmin === 1) {
          req.session.isAdmin = true;
          req.session.isLoggedIn = true;
          req.session.name = "Admin";
          console.log("Admin is logged in!");
        } else {
          req.session.isAdmin = false;
          req.session.isLoggedIn = true;
          req.session.name = user.username;
          console.log("User is logged in!");
        }
        res.redirect("/");
      } else {
        console.log("Wrong password. Username:", username); // Debugging
        req.session.isLoggedIn = false;
        req.session.isAdmin = false;
        req.session.name = "";
        res.render("login.handlebars", { error: "Wrong password" });
      }
    }
  });
});

// defines a middleware to log all the incoming requests' URL
app.use((req, res, next) => {
    console.log("Req. URL: ", req.url)
    next()
});

app.get('/', (req, res)=> {
  res.render('home', { user: req.session?.user});
});

//contact form submission
app.post("/contact", (req, res) => {
  const { name, email, subject, message } = req.body;

  const model = {
    isLoggedIn: req.session.isLoggedIn,
    name: req.session.name,
    isAdmin: req.session.isAdmin,
  };

  // Insert the form data into the database
  db.run(
    `
    INSERT INTO contact (cname, cemail, csubject, cmessage)
    VALUES (?, ?, ?, ?)
  `,
    [name, email, subject, message],
    (error) => {
      if (error) {
        console.log("Error inserting data into the contact table: ", error);
      } else {
        console.log("Data inserted into the contact table.");
      }
      res.render("contact.handlebars", model);
    }
  );
});


//defines the contact route
app.get("/contact", (req, res) => {
  db.all("SELECT * FROM contact", (error, contactData) => {
    if (error) {
      console.log("Error retrieving contact data: ", error);
    } else {
      const model = {
        contact: contactData,
        isLoggedIn: req.session.isLoggedIn,
        name: req.session.name,
        isAdmin: req.session.isAdmin,
      };
      res.render("contact.handlebars", model);
    }
  });
});

app.get("/messages", (req, res) => {
    db.all("SELECT * FROM contact", (error, contact) => {
      if (error) {
        const model = {
          hasDatabaseError: true,
          theError: error,
          isLoggedIn: req.session.isLoggedIn,
          name: req.session.name,
          isAdmin: req.session.isAdmin,
          contact: contact,
        };
        res.render("messages.handlebars", model);
      } else {
        const model = {
          hasDatabaseError: false,
          theError: "",
          isLoggedIn: req.session.isLoggedIn,
          name: req.session.name,
          isAdmin: req.session.isAdmin,
          contact: contact,
        };
        res.render("messages.handlebars", model);
      }
    });
});

// creates a new message
app.post("/messages", (req, res) => {
  const nm = [
    req.body.contname,
    req.body.contemail,
    req.body.conttype,
    req.body.contmessage,
  ];

  if (req.session.isLoggedIn == true && req.session.isAdmin == true) {
    db.run(
      "INSERT INTO contact (cname, cemail, ctype, cmessage) VALUES (?, ?, ?, ?)",
      nm,
      (error) => {
        if (error) {
          console.log("ERROR: ", error);
        } else {
          console.log("Line added into the contact table!");
        }
        res.redirect("/contact");
      }
    );
  } else {
    res.redirect("/login");
  }
});

// delete a message from messages page
app.post("/messages/delete/:id", (req, res) => {
  if (req.session.isLoggedIn && req.session.isAdmin) {
    const id = req.params.id;

    // deleting the entry
    db.run("DELETE FROM contact WHERE cid = ?", [id], (error) => {
      if (error) {
        const model = {
          hasDatabaseError: true,
          theError: error,
          isLoggedIn: req.session.isLoggedIn,
          name: req.session.name,
          isAdmin: req.session.isAdmin,
        };
        res.render("messages", model);
      } else {
        res.redirect("/messages");
      }
    });
  } else {
    res.redirect("/login");
  }
});

// Create a new series (GET and POST)
app.get("/series/new", (req, res) => {
  if (req.session.isLoggedIn && req.session.isAdmin) {
    const model = {
      isLoggedIn: req.session.isLoggedIn,
      name: req.session.name,
      isAdmin: req.session.isAdmin,
    };
    res.render("newseries.handlebars", model);
  } else {
    res.redirect("/login");
  }
});

app.post("/series/new", (req, res) => {
  if (req.session.isLoggedIn && req.session.isAdmin) {
    const ns = [req.body.sname, req.body.stype, req.body.sdesc];
    db.run(
      "INSERT INTO series (sname, stype, sdesc) VALUES (?, ?, ?)",
      ns,
      (error) => {
        if (error) {
          console.log("ERROR: ", error);
        } else {
          console.log("Series added!");
        }
        res.redirect("/series");
      }
    );
  } else {
    res.redirect("/login");
  }
});

// Edit a series (GET and POST)
app.get("/series/update/:id", (req, res) => {
  if (req.session.isLoggedIn && req.session.isAdmin) {
    const id = req.params.id;
    db.get(
      "SELECT * FROM series WHERE sid = ?",
      [id],
      function (error, theSeries) {
        if (error) {
          console.log("ERROR: ", error);
          const model = {
            dbError: true,
            theError: error,
            series: {},
            isLoggedIn: req.session.isLoggedIn,
            name: req.session.name,
            isAdmin: req.session.isAdmin,
          };
          res.render("editSeries.handlebars", model);
        } else {
          const model = {
            dbError: false,
            theError: "",
            series: theSeries,
            isLoggedIn: req.session.isLoggedIn,
            name: req.session.name,
            isAdmin: req.session.isAdmin,
          };
          res.render("editSeries.handlebars", model);
        }
      }
    );
  } else {
    res.redirect("/login");
  }
});

app.post("/series/update/:id", (req, res) => {
  if (req.session.isLoggedIn && req.session.isAdmin) {
    const id = req.params.id;
    const ns = [req.body.sname, req.body.stype, req.body.sdesc, id];
    db.run(
      "UPDATE series SET sname=?, stype=?, sdesc=? WHERE sid=?",
      ns,
      (error) => {
        if (error) {
          console.log("ERROR: ", error);
        } else {
          console.log("Series updated!");
        }
        res.redirect("/series");
      }
    );
  } else {
    res.redirect("/login");
  }
});

// Delete a series (POST)
app.post("/series/delete/:id", (req, res) => {
  if (req.session.isLoggedIn && req.session.isAdmin) {
    const id = req.params.id;
    db.run("DELETE FROM series WHERE sid = ?", [id], (error) => {
      if (error) {
        console.log("ERROR: ", error);
      } else {
        console.log("Series deleted!");
      }
      res.redirect("/series");
    });
  } else {
    res.redirect("/login");
  }
});


// renders a view WITHOUT DATA
app.get('/about', (req, res) => {
    res.render('about');
});

app.get('/menu', (req, res)=> {
  res.render('menu');
});
//shows each project on click
app.get("/projects/:id", function (req, res) {
  const id = req.params.id;

  db.get(
    "SELECT * FROM projects WHERE pid = ?",
    [id],
    function (error, project) {
      if (error) {
        const model = {
          hasDatabaseError: true,
          theError: error,
          isLoggedIn: req.session.isLoggedIn,
          name: req.session.name,
          isAdmin: req.session.isAdmin,
        };
        res.render("project.handlebars", model);
      } else if (!project) {
        // Project not found, send an appropriate response
        const model = {
          hasDatabaseError: false,
          theError: "",
          isLoggedIn: req.session.isLoggedIn,
          name: req.session.name,
          isAdmin: req.session.isAdmin,
          projectNotFound: true
        };
        res.render("project.handlebars", model);
      } else {
        const model = {
          hasDatabaseError: false,
          theError: "",
          pid: project.pid,
          pname: project.pname,
          pyear: project.pyear,
          ptype: project.ptype,
          pimgURL: project.pimgURL,
          isLoggedIn: req.session.isLoggedIn,
          name: req.session.name,
          isAdmin: req.session.isAdmin,
        };
        res.render("project.handlebars", model);
      }
    }
  );
});


app.get("/projects", function (req, res) {
  db.all("SELECT * FROM projects", function (error, theProjects) {
    if (error) {
      const model = {
        hasDatabaseError: true,
        theError: error,
        projects: [],
        isLoggedIn: req.session.isLoggedIn,
        name: req.session.name,
        isAdmin: req.session.isAdmin,
      };
      res.render("projects.handlebars", model);
    } else {
      const model = {
        hasDatabaseError: false,
        theError: "",
        projects: theProjects,
        isLoggedIn: req.session.isLoggedIn,
        name: req.session.name,
        isAdmin: req.session.isAdmin,
      };
      res.render("projects.handlebars", model);
    }
  });
});

// run the server and make it listen to the port
app.listen(port, () => {
    console.log(`Server running and listening on port ${port}...`)
});