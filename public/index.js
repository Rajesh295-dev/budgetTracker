let transactions = [];
let myChart;


// Function to update the UI based on the transactions array
function updateUI() {
  populateTotal();
  populateTable();
  populateChart();
}

document.getElementById('login-form').addEventListener('submit', function (event) {
  // event.preventDefault(); // Prevent form submission
  updateUI();
});

function clearUI() {
  clearTotal();
  clearTable();
  clearChart();
}

function clearTotal() {
  document.getElementById('total').textContent = '';
}

function clearTable() {
  const tbody = document.querySelector('#tbody');
  tbody.innerHTML = ''; // Clear all rows

}

function clearChart() {
  const canvas = document.getElementById('myChart');
  const context = canvas.getContext('2d');
  context.clearRect(0, 0, canvas.width, canvas.height);
}

document.querySelector('.logout-btn').addEventListener('click', function () {
  clearUI();
});



// Check if user is logged in
const userData = getUserData();
const userId = userData ? userData._id : null;

// Fetch transactions only if user is logged in
const transactionFetchPromise = userId ?
  fetch(`/api/transaction?userId=${userId}`)
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to fetch transactions');
      }
      return response.json();
    }) :
  Promise.resolve([]);

// Process the fetched transactions
transactionFetchPromise
  .then(data => {
    // Save db data to global variable
    transactions = data;
    // Update the UI based on the initial data
    updateUI();
  })
  .catch(error => {
    console.error('login to see the trascations:', error);
  });


function populateTotal() {
  // reduce transaction amounts to a single total value
  let total = transactions.reduce((total, t) => {
    return total + parseInt(t.value);
  }, 0);

  let totalEl = document.querySelector("#total");
  totalEl.textContent = total;
}

function populateTable() {
  let tbody = document.querySelector("#tbody");
  tbody.innerHTML = "";

  transactions.forEach(transaction => {
    // create and populate a table row
    let tr = document.createElement("tr");
    tr.innerHTML = `
      <td data-id="${transaction._id}">${transaction.name}</td>
      <td><input type="number" value="${transaction.value}" class="amount-input" data-id="${transaction._id}"></td>
      <td>
      <button class="delete-button" data-id="${transaction._id}">Delete</button>
      <button class="update-button" data-id="${transaction._id}">Update</button>
      </td>

    `;
    tr.dataset.id = transaction._id;
    tbody.appendChild(tr);
  });

  // Add event listeners for delete and update buttons
  tbody.querySelectorAll(".delete-button").forEach(button => {
    button.addEventListener("click", () => {
      const transactionId = button.dataset.id; // Corrected to button.dataset.id
      deleteTransaction(transactionId);
    });
  });

  tbody.querySelectorAll(".update-button").forEach(button => {
    button.addEventListener("click", () => {
      const transactionId = button.dataset.id; // Corrected to button.dataset.id
      updateTransaction(transactionId);
    });
  });
}




function deleteTransaction(transactionId) {
  if (!transactionId) {
    console.error('Transaction ID is undefined');
    return;
  }

  // Send a request to the server to delete the transaction with the given ID
  fetch(`/api/transaction/${transactionId}`, {
    method: 'DELETE'
  })
    .then(response => response.json())
    .then(data => {

      // console.log('Transaction deleted successfully:', data);

      // Remove the corresponding row from the table0
      const row = document.querySelector(`tr[data-id="${transactionId}"]`);
      // console.log("this is a row", row)
      if (row) {
        row.remove();
      } else {
        console.error('Row not found for transaction ID:', transactionId);
      }
    })
    .then(() => {
      // Refresh the UI after deleting the transaction
      populateTotal();
      populateChart();
    })
    .catch(error => {
      console.error('Error deleting transaction:', error);
    });
}

function updateTransaction(transactionId) {
  const inputValue = document.querySelector(`.amount-input[data-id="${transactionId}"]`).value;
  const updatedTransaction = {
    value: inputValue
  };

  // Send the updated transaction to the server for processing
  fetch(`/api/transaction/${transactionId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(updatedTransaction)
  })
    .then(response => response.json())
    .then(data => {
      // Handle the response from the server (if needed)
      // console.log('Transaction updated successfully:', data);
    })
    .catch(error => {
      console.error('Error updating transaction:', error);
    });
}





function populateChart() {
  // copy array and reverse it
  let reversed = transactions.slice().reverse();
  let sum = 0;

  // create date labels for chart
  let labels = reversed.map(t => {
    let date = new Date(t.date);
    return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
  });

  // create incremental values for chart
  let data = reversed.map(t => {
    sum += parseInt(t.value);
    return sum;
  });

  // remove old chart if it exists
  if (myChart) {
    myChart.destroy();
  }

  let ctx = document.getElementById("myChart").getContext("2d");

  myChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: "Total Over Time",
        fill: true,
        backgroundColor: "#6666ff",
        data
      }]
    }
  });
}




function sendTransaction(isAdding) {

  let nameEl = document.querySelector("#t-name");
  let amountEl = document.querySelector("#t-amount");
  let errorEl = document.querySelector(".form .error");

  // validate form
  if (nameEl.value === "" || amountEl.value === "") {
    errorEl.textContent = "Missing Information";
    return;
  }
  else {
    errorEl.textContent = "";
  }

  // Retrieve userId from sessionStorage
  const userDataString = sessionStorage.getItem('userData');
  const userData = userDataString ? JSON.parse(userDataString) : null;
  const userId = userData ? userData._id : null;

  // Check if userId is defined
  if (!userId) {
    console.error('User ID not found. Please log in.');
    return;
  }

  // create record
  let transaction = {
    name: nameEl.value,
    value: amountEl.value,
    user: userId,
    date: new Date().toISOString()
  };

  // console.log("Transaction value:", transaction);

  // if subtracting funds, convert amount to negative number
  if (!isAdding) {
    transaction.value *= -1;
  }

  // add to beginning of current array of data
  transactions.unshift(transaction);

  // re-run logic to populate ui with new record
  populateChart();
  populateTable();
  populateTotal();

  fetch("/api/transaction", {
    method: "POST",
    body: JSON.stringify(transaction),
    headers: {
      Accept: "application/json, text/plain, */*",
      "Content-Type": "application/json"
    }
  })
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      if (data.errors) {
        errorEl.textContent = "Missing Information";
      }
      else {
        // clear form
        nameEl.value = "";
        amountEl.value = "";

      }
    })
    .catch(err => {
      // fetch failed, so save in indexed db
      console.log("Items saved in IndexDB :", transaction);
      saveRecord(transaction);

      // clear form
      nameEl.value = "";
      amountEl.value = "";
    });
}




document.querySelector("#add-btn").onclick = function (event) {
  sendTransaction(true);
  event.preventDefault();
};

document.querySelector("#sub-btn").onclick = function (event) {
  sendTransaction(false);
  event.preventDefault();
};


// Listen for updates from the server and update the UI accordingly
window.addEventListener('updateUI', updateUI);




