var mysql = require("mysql"),
	inquirer = require("inquirer"),

// create the connection information for the sql database
	connection = mysql.createConnection({

	  	host: "localhost",
		port: 3306,
		user: "root",
		password: "",
		database: "bieBay"

});

// connect to the mysql server
connection.connect(function(err) {
  if (err) throw err;
  // run the start function after the connection is made to prompt the user
  supervisorList();
});

function supervisorList(){

	inquirer.prompt({

		type: "list",
		name: "initial",
		message: "What would you like to do?",
		choices: ["View Product Sales by Department", "Create New Department"]
	}).then(function(answer){

		if(answer.initial === "View Product Sales by Department"){
			viewSales();
		}else if(answer.initial === "Create New Department"){
			createDepartment();
		}
	});
}

function viewSales(){

	connection.query("SELECT * FROM `departments`;", function(err, results){

		if (err) throw err;

		console.log(results);
		
	});
}

function createDepartment(){

}

