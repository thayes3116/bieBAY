var mysql = require("mysql"),
	inquirer = require("inquirer"),

	addQuantity,
	addItem,
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
  managerList();
});
//initial manager prompt
function managerList(){
	inquirer.prompt({
		type: "list",
		name: "managerPrompt",
		message: "What would you like to do?",
		choices: ["View products for sale", "View Low Inventory", "Add To Inventory", "Add New Product","Exit"]
	}).then(function(answer){

		if(answer.managerPrompt === "View products for sale"){
			viewProducts();
		}else if(answer.managerPrompt === "View Low Inventory"){
			viewLowInventory();
		}else if(answer.managerPrompt === "Add To Inventory"){
			addToInventory();
		}else if(answer.managerPrompt === "Add New Product"){
			addNewProduct();
		}else if(answer.managerPrompt === "Exit"){
			exit();
		}
	});
}
//function to view products
function viewProducts(){
	//search for table of available items and display
	connection.query("SELECT * FROM `products`", function(err, results){

		if (err) throw err;

		console.log(results);

		inquirer.prompt({

			type: "list",
			name: "managerPrompt",
			message: "What would you like to do?",
			choices: ["View Low Inventory", "Add To Inventory", "Add New Product", "Return to Main Menu", "Exit"]

		}).then(function(answer){

			if(answer.managerPrompt === "View Low Inventory"){
				viewLowInventory();
			}else if(answer.managerPrompt === "Add To Inventory"){
				addToInventory();
			}else if(answer.managerPrompt === "Add New Product"){
				addNewProduct();
			}else if(answer.managerPrompt === "Return to Main Menu"){
				managerList();
			}else if(answer.managerPrompt === "Exit"){
				exit();
			}

		});
	});
}

//function to view low inventory
function viewLowInventory(){

	//search for table of available items and display items low in stock
	connection.query("SELECT `item_id`, `product_name`, `stock_quantity` FROM `products` WHERE stock_quantity < 20;", function(err, results){

		if (err) throw err;

		console.log(results);
		//offer reorder
		inquirer.prompt({
			type: "confirm",
			name: "confirm",
			message: "Would you like to order more of an item?"
		}).then(function(answer){

			if (answer.confirm === true){

				console.log("In the future, this will fire a function to assist with the reorder process")

			}else if(answer.confirm === false){

				console.log("No reorder is scheduled at this time");
			}
				
			inquirer.prompt({
				type: "list",
				name: "managerPrompt",
				message: "What would you like to do?",
				choices: ["View products for sale", "Add To Inventory", "Add New Product", "Return to Main Menu", "Exit"]

			}).then(function(answer){

				if(answer.managerPrompt === "View products for sale"){
					viewProducts();
				}else if(answer.managerPrompt === "Add To Inventory"){
					addToInventory();
				}else if(answer.managerPrompt === "Add New Product"){
					addNewProduct();
				}else if(answer.managerPrompt === "Return to Main Menu"){
					managerList();
				}else if(answer.managerPrompt === "Exit"){
					exit();
				}
			});
		});
	});
}

//function to add to inventory
function addToInventory(){
	//get id and quantity from the user
	inquirer.prompt([
		{
			type: "input",
			name: "ID",
			message: "To which item would you like to add inventory?  Please enter a item ID#",
			validate: function(value) {
	          	if (isNaN(value) === false) {
	          		return true;
	          	}
	          		return false;
        	}
		},
		{
			type: "input",
			name: "quantity",
			message: "How many item's would you like too add?",
			validate: function(value) {
	          	if (isNaN(value) === false) {
	          		return true;
	          	}
	          		return false;
        	}
		}
	]).then(function(answer){

		//set global variables to eliminate scope issue
    	addItem = parseInt(answer.ID);
    	addQuantity = parseInt(answer.quantity);
    	
    	//query to check that item ID matches an actual product
    	connection.query("SELECT 1 FROM `products` WHERE `item_id` = ?", [addItem], function(err, results){
		
			if (err) throw err
			//ensure quantity and item id are valid
	    	if(addQuantity < 1 || results[0] == undefined){

	    		console.log("Please enter a quantity greater than 0 and valid item ID");

	    		addToInventory();

	    	}else{
	    		//check to make sure addition info is correct
	    		 inquirer.prompt({
	    		 	type: "confirm",
	    		 	name: "continue",
	    		 	message: "You are adding "+addQuantity+" of item ID# "+addItem+" to stock. Continue?"

	    		 }).then(function(go){

	    		 	if(go.continue === false){

	    		 		console.log("Addition canceled");
	    		 		managerList();

	    		 	}else if(go.continue === true){
	    		 		//get current stock before addition
						connection.query("SELECT `stock_quantity` FROM `products` WHERE `item_id` = ?", [addItem], function(err, before){

							if (err) throw err	
							//update database
							connection.query("UPDATE `products` SET `stock_quantity`= ? WHERE `item_id` = ?;",[before[0].stock_quantity+addQuantity, addItem],  function(err){
								
								if (err) throw err;	
								//make sure database was updated
								connection.query("SELECT `stock_quantity` FROM `products` WHERE `item_id` = ?", [addItem], function(err, after){

									if (err) throw err
									//provide summary of action to user
									console.log("You have added "+addQuantity+" of item ID# "+addItem+" to the inventory. You now have "+after[0].stock_quantity+" in stock.");
								
									inquirer.prompt({
										type: "list",
										name: "managerPrompt",
										message: "What would you like to do?",
										choices: ["Add inventory to another item", "View products for sale", "View Low Inventory", "Add New Product", "Return to Main Menu", "Exit"]

									}).then(function(answer){

										if(answer.managerPrompt === "Add inventory to another item"){
											addToInventory();
										}else if(answer.managerPrompt === "View products for sale"){
											viewProducts();
										}else if(answer.managerPrompt === "View Low Inventory"){
											viewLowInventory();
										}else if(answer.managerPrompt === "Add New Product"){
											addNewProduct();
										}else if(answer.managerPrompt === "Return to Main Menu"){
											managerList();
										}else if(answer.managerPrompt === "Exit"){
											exit();
										}
									});
								});	
							});	
						});
					}
				});		
			}
		});	
	});			
}

//function to add a new product
function addNewProduct(){
	//get user input for new product
	inquirer.prompt([
		{
			type: "input",
			name: "product",
			message: "Enter the product name"
		},
		{
			type: "list",
			name: "department",
			message: "Enter the department name",
			choices: ["Clothing", "Music", "Misc", "Holiday", "Party Supplies"]
		},
		{
			type: "input",
			name: "price",
			message: "Enter the price",
			validate: function(value) {
	          	if (isNaN(value) === false) {
	          		return true;
	          	}
	          		return false;
        	}
		},
		{
			type: "input",
			name: "stock",
			message: "Enter stock quantity",
			validate: function(value) {
	          	if (isNaN(value) === false) {
	          		return true;
	          	}
	          		return false;
        	}
		},
		{
			type: "confirm",
			name: "auto",
			message: "Is it/Are they autographed?"
		}	
	]).then(function(answer){
		//Check validity of user input
		if(answer.product === "" || answer.price <= 0 || parseInt(answer.stock) <= 0){

			console.log("Please enter a valid product name, price, and stock quantity");

			addNewProduct();

		}else{
			//check with user before addition
			inquirer.prompt({
				
				type: "confirm",
				name: "confirm",
				message: "You are about to add this item to your inventory\nProduct Name: "+answer.product+"\nDepartment: "+answer.department+"\nPrice: "+answer.price+"\nStock Quantity: "+answer.stock+"\nAutographed: "+answer.auto+"\nContinue entering item?"
			}).then(function(answer){

				if(answer.confirm === false){

					console.log("Inventory addition canceled");
					managerList();

				}else if(answer.confirm === true){

					console.log("Your addition was processed");

					inquirer.prompt({
					type: "list",
					name: "managerPrompt",
					message: "What would you like to do?",
					choices: ["Add another Product", "View products for sale", "View Low Inventory", "Add To Inventory", "Return to Main Menu", "Exit"]

					}).then(function(answer){

						if(answer.managerPrompt === "Add another Product"){
							addNewProduct();
						}else if(answer.managerPrompt === "View products for sale"){
							viewProducts();
						}else if(answer.managerPrompt === "View Low Inventory"){
							viewLowInventory();
						}else if(answer.managerPrompt === "Add To Inventory"){
							addToInventory();
						}else if(answer.managerPrompt === "Return to Main Menu"){
							managerList();
						}else if(answer.managerPrompt === "Exit"){
							exit();
						}
					});
				}
			});				
		}
			
	});		
}
//function to exit
function exit(){
	console.log("Logging out");
}
