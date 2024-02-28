const router = require("express").Router();
const Transaction = require("../models/transaction.js");



// Create a new transaction
router.post("/api/transaction", ({ body }, res) => {
  Transaction.create(body)
    .then(dbTransaction => {
      res.json(dbTransaction);
    })
    .catch(err => {
      res.status(404).json(err);
    });
});



// Create multiple transactions in bulk
router.post("/api/transaction/bulk", ({ body }, res) => {
  Transaction.insertMany(body)
    .then(dbTransaction => {
      res.json(dbTransaction);
    })
    .catch(err => {
      res.status(404).json(err);
    });
});

// Retrieve all transactions
router.get("/api/transaction", (req, res) => {
  console.log("GET request received for all transactions");
  Transaction.find({}).sort({ date: -1 })
    .then(dbTransaction => {
      res.json(dbTransaction);
    })
    .catch(err => {
      res.status(404).json(err);
    });
});

// Update a transaction
router.put("/api/transaction/:id", (req, res) => {
  const { id } = req.params;
  const { value } = req.body;

  Transaction.findByIdAndUpdate(id, { value }, { new: true })
    .then(dbTransaction => {
      if (!dbTransaction) {
        return res.status(404).json({ message: "Transaction not found" });
      }
      res.json(dbTransaction);
    })
    .catch(err => {
      res.status(400).json(err);
    });
});

// Delete a transaction by ID
router.delete("/api/transaction/:id", (req, res) => {
  Transaction.findByIdAndDelete(req.params.id)
    .then(dbTransaction => {
      if (dbTransaction) {
        res.json({ message: "Transaction deleted successfully" });
      } else {
        res.status(404).json({ message: "Transaction not found" });
      }
    })
    .catch(err => {
      res.status(500).json(err);
    });
});
module.exports = router;