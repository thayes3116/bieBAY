var mysql = require("mysql"),
	inquirer = require("inquirer"),

	customerItem,
	customerQuantity,
	remainingStock,

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
  start();
});

//function to start
function start(){
	//search for table of available items and display
	connection.query("SELECT * FROM `products`", function(err, results){

		if (err) throw err;

		console.log(results);
		customerPrompt();

	});
}
//function for customer to choose item and quantity
function customerPrompt() {
  	//customer prompt to pick item and quantity with validation
  	inquirer.prompt([
    	{
    		type: "input",
    		name: "ID",
    		message: "Please enter item ID",
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
    		message: "Please enter the quantity to purchase",
    		validate: function(value) {
	          	if (isNaN(value) === false) {
	          		return true;
	          	}
	          		return false;
        	}	
    	}

    ]).then(function(answer){
    	//set global variables to eliminate scope issue
    	customerItem = answer.ID;
    	customerQuantity = answer.quantity;
    	//query to check that item ID matches an actual product
    	connection.query("SELECT 1 FROM `products` WHERE `item_id` = ?", [customerItem], function(err, results){
		
			if (err) throw err
			//ensure quantity and item id are valid
	    	if(answer.quantity < 1 || results[0] == undefined){

	    		console.log("Please enter a quantity greater than 0 and valid item ID");

	    		customerPrompt();

	    	}else{
	    		//prompt to confirm order
		    	inquirer.prompt({
		    		type: "confirm",
		    		name: "confirm",
		    		message: "You choose to purchase "+parseInt(answer.quantity)+" of item ID "+customerItem+"\nWould you like to continue with your purchase?"

		    	}).then(function(answer){

		    		if (answer.confirm === true){

		    			completeSale();

		    		}else if(answer.confirm === false){

		    			customerPrompt();
		    		}
		    	});		
		    }
		});    
    });
}

function completeSale(){
	//query customer item 
	connection.query("SELECT * FROM `products` WHERE `item_id` = ?", [customerItem], function(err, results){
		
		if (err) throw err
		//make sure enough of itme ia available
		if(customerQuantity <= results[0].stock_quantity){
			//ask customer to finalize purchase with price
			inquirer.prompt({

	    		type: "confirm",
	    		name: "confirm",
	    		message: "Total cost for "+customerQuantity+" of "+results[0].product_name+" is $"+(customerQuantity*results[0].price)+"\nFinalize your purchase?"

	    	}).then(function(answer){
	    		//process order and decrease available stock
	    		if (answer.confirm === true){

	    			console.log("Congratulations, your order will be shipped. If you are not a teenage girl, you need to take a look at your life.");

	    			connection.query("UPDATE `products` SET `stock_quantity`= ? WHERE `item_id` = ?;",[results[0].stock_quantity-customerQuantity, customerItem],  function(err){
		
						if (err) throw err;	

		    		});
	    		//restart if customer doesn't confirm
	    		}else if(answer.confirm === false){

	    			console.log("Transaction Canceled");

	    		}

	    		continueShopping();

	    	});	

		}else{
			//if not enough of item
			console.log("Insufficient quantity! \n");
			console.log("I'm sorry we only have "+results[0].stock_quantity+" of "+results[0].product_name+" available");

			continueShopping();
		}	
	});				
}
//prompt to see if guest wants to continue shopping
function continueShopping(){

	inquirer.prompt({

		type: "confirm",
		name: "confirm",
		message: "Would you like to continue shopping?"

    		}).then(function(answer){

    			if (answer.confirm === true){

    			start();

    		}else if(answer.confirm === false){

    			console.log("Thank you for shopping");
    		}
		});	
}