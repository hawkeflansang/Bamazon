var inquirer = require("inquirer");

var Password = function () {
    this.getPassword = function (callback) {
        inquirer.prompt({
            name: "password",
            message: "Please enter password for root user for MySql:",
            type: "password"
        }).then((ans) => {
            callback(ans.password);
        });
    }
}

module.exports = Password;