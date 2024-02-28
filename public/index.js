let transactions = [];
let myChart;



fetch("/api/transaction")
  .then(response => {
    return response.json();
  })
  .then(data => {
    // save db data on global variable
    transactions = data;

    populateTotal();
    populateTable();
    populateChart();
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
      console.log('Transaction updated successfully:', data);
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

  // create record
  let transaction = {
    name: nameEl.value,
    value: amountEl.value,
    date: new Date().toISOString()
  };

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
      // console.log("Items saved in IndexDB :", transaction);
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





