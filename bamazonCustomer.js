var mysql = require("mysql");
var inquirer = require("inquirer");
var Password = require("./password");

new Password().getPassword(login); // main/entry-point

function login(password) {
    var connection = mysql.createConnection({
        host: "localhost",
        port: 3306,
        user: "root",
        password: password,
        database: "bamazon_db"
    });

    connection.connect(function (err) {
        if (err) throw err;
        console.log("connected as id " + connection.threadId + "\n");
        // connection.end();
        tableDisplay(connection);
    });
}

var tableDisplay = function(conn) {
  conn.query("Select * from products;", function (err, res) {
    if (err) console.log(err);
    console.log("Our Stock \n");
    console.table(res);
    buyOrLeave(conn);
});
}

var buyOrLeave = function(conn) {
  inquirer.prompt(
    [
        {
            name: "userChoice",
            message: "What would you like to do?",
            type: "list",
            choices: ["Buy Items", "Exit"]
        }
    ]
).then(function(answer) {
    if (answer.userChoice === "Buy Items") buyItem(conn);
    else {
        conn.end();
    }
});
}

