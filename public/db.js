let db;

// Create a new db request for a "BudgetDB" database.
const request = window.indexedDB.open("BudgetDB", 1);

// create object store called "BudgetDB" and set autoIncrement to true
request.onupgradeneeded = function (event) {

    db = event.target.result;
    db.createObjectStore("BudgetDB", {
        autoIncrement: true
    });
};



request.onerror = function (event) {
    console.log("IndexedDB error:", event.target.errorCode);
};

request.onsuccess = function (event) {
    // console.log('success');
    db = event.target.result;

    // Check if app is online before reading from db
    if (navigator.onLine) {
        // console.log('Backend online! 🗄️');
        checkDatabase();
    }
};

function checkDatabase() {
    console.log('check db invoked');
    console.log("IndexDB items > 0", length.db)
}


function saveRecord(record) {
    //create a transaction on the pending db with readwrite access
    const transaction = db.transaction(["BudgetDB"], "readwrite");
    const BudgetStore = transaction.objectStore("BudgetDB");
    BudgetStore.add(record);
}



//Open a transaction on your Budget db
function checkDatabase() {
    let transaction = db.transaction(["BudgetDB"], "readwrite");
    const BudgetStore = transaction.objectStore("BudgetDB");
    var getAll = BudgetStore.getAll();


    // If the request was successful
    getAll.onsuccess = function () {
        //If there are items in the store, we need to bulk add them when we are back online
        if (getAll.result.length > 0) {
            console.log("IndexDB items:", getAll.result);
            fetch('/api/transaction/bulk', {
                method: 'POST',
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'Content-Type': 'application/json',
                },
            })
                .then((response) => response.json())
                .then((data) => {
                    if (data.length > 0) {
                        transaction = db.transaction(["BudgetDB"], "readwrite");
                        const newStore = transaction.objectStore("BudgetDB");
                        // Clear existing entries because our bulk add was successful
                        newStore.clear();
                        console.log('Clearing store 🧹');
                    }
                });
        }

    };
}

// Listen for app coming back online
window.addEventListener('online', checkDatabase);


