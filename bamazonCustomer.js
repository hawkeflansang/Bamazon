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
        process.exit(0);
    }
});
}

var buyItem = function(conn) {
  inquirer.prompt(
    [
        {
            name: "productID",
            message: "What product would you like to buy (enter item_id)?",
            type: "number",
        },
        {
            name: "purchaseQuant",
            message: "Please enter the amount of item",
            type: "number"
        }
    ]
).then(function(answer) {
    //retrieving the original quantity to be reduced by the user amount
    conn.query("Select stock_quantity from products where ?;",
        [
            {
                item_id: answer.productID
            }
        ], function(err, res) {
            if (err) console.log(err);
            var orig = res[0].stock_quantity;
            if (parseInt(orig) >= parseInt(answer.purchaseQuant)) { //if the original value in the DB is greater than userAmt, then update the db, otherwise throw insufficient quant
                conn.query("Select stock_quantity, price from products where ?;",
                    [
                        {
                            item_id: answer.productID
                        }
                    ], function(err, res) {
                        if (err) console.log(err);
                        var origQuantity = res[0].stock_quantity; //IMPORTANT: need this to retrieve just the VALUE of the query (which is `select stock_quantity from...`)
                        var total = parseInt(res[0].price * answer.purchaseQuant);
                        console.log("Your total cost is: $", total + "\n");
                        updateDB(origQuantity, answer.purchaseQuant, answer.productID, conn);
                    });
            } else {
                console.log("Insufficient quantity" + "\n");
                tableDisplay(conn);
            }
        });
});
}

var updateDB = function(orig, userAmt, itemID, conn) {
    //query to reduce the amount of quantity by user amount
    var query = conn.query(
        "UPDATE products SET ? WHERE ?;",
        [
            {
                stock_quantity: parseInt(orig) - parseInt(userAmt)
            },
            {
                item_id: itemID
            }
        ], function (err, res) {
            if (err) throw err;
            console.log(res.affectedRows + " products updated!\n");
            tableDisplay(conn);
            buyOrLeave(conn);
        });
}