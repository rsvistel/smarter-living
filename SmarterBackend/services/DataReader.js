const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');
const Transaction = require('../models/Transaction');

class DataReader {
  constructor() {
    this._transactions = [];
    this._isLoaded = false;
  }

  async loadData() {
    if (this._isLoaded) {
      return this.getTransactions();
    }

    return new Promise((resolve, reject) => {
      const csvPath = path.join(__dirname, '../data/data.csv');
      const transactions = [];

      fs.createReadStream(csvPath)
        .pipe(csv())
        .on('data', (row) => {
          try {
            const transaction = new Transaction(row);
            transactions.push(transaction);
          } catch (error) {
            console.warn('Error parsing row:', error.message);
          }
        })
        .on('end', () => {
          this._transactions = Object.freeze(transactions);
          this._isLoaded = true;
          console.log(`Loaded ${this._transactions.length} transactions`);
          resolve(this.getTransactions());
        })
        .on('error', (error) => {
          reject(error);
        });
    });
  }

  getTransactions() {
    return this._transactions;
  }

  getTransactionCount() {
    return this._transactions.length;
  }

  isLoaded() {
    return this._isLoaded;
  }
}

module.exports = DataReader;