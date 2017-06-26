var mysql = require("mysql"),
	inquirer = require("inquirer"),
	Table = require('cli-table'),

	table,
	tableColumns = ['department_id', 'department_name', 'over_head_costs', 'product_sales', 'total_profit'],
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

	connection.query("SELECT *, (product_sales - over_head_costs) AS total_profit FROM `departments`;", function(err, results){

		if (err) throw err;
		
		var table = new Table({
		    head: tableColumns, 
		    colWidths: [20, 20, 20, 20, 20]
			});
			
		for(var i = 0 ; i < results.length ; i ++){

			var tempArray = [];
			
			for(var j = 0 ; j < tableColumns.length ; j ++){

				tempArray.push(results[i][tableColumns[j]]);

			}

			table.push(tempArray);
			
		}

		console.log(table.toString());
		supervisorList();
	});

	
}

function createDepartment(){
	
	inquirer.prompt([
	{
		type: "input",
		name: "department_name",
		message: "What is the name of the new department?"		
	},
	{
		type: "input",
		name: "costs",
		message: "What are the over head costs?",
		validate: function(value) {
	          	if (isNaN(value) === false) {
	          		return true;
	          	}
	          		return false;
        }
	},
	{
		type: "input",
		name: "sales",
		message: "What are the current product sales?",
		validate: function(value) {
	          	if (isNaN(value) === false) {
	          		return true;
	          	}
	          		return false;
        }
	}
	]).then(function(answer){

		connection.query("SELECT 1 FROM `products` WHERE `department_name` = ?", [answer.department_name], function(err, results){
			
			if (err) throw err

			if(answer.sales < 0 || answer.costs < 0 || results[0] == 1){

				console.log("Please enter a new department name with a cost and current sales >= 0");

				createDepartment();

			}else{

				inquirer.prompt({
				
				type: "confirm",
				name: "confirm",
				message: "You are about to add this department\nDepartment Name: "+answer.department_name+"\nOver Head Cost: "+answer.costs+"\nCurrent Sales: "+answer.sales+"\nContinue adding department?"

				}).then(function(ans){
				
					if(ans.confirm === false){

						console.log("Department addition canceled");
						supervisorList();

					}else if(ans.confirm === true){

						connection.query("INSERT INTO `departments`(`department_name`, `over_head_costs`, `product_sales`) VALUES (?, ?, ?);", [answer.department_name, answer.costs, answer.sales], function(err){
			
							if (err) throw err

							console.log("Your addition was processed");

							supervisorList();
						});	
					}
				});	
			}
		});	
	});	
}

