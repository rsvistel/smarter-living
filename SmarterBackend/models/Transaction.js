class Transaction {
  constructor(data) {
    this.cardId = data.CardId;
    this.ageCat = data.Age_cat;
    this.trxDate = data.trx_date;
    this.trxCode = data.trx_code;
    this.trxAmount = parseFloat(data.trx_amount);
    this.trxCurrency = data.trx_currency;
    this.trxDesc = data.trx_desc;
    this.trxCity = data.trx_city;
    this.trxCountry = data.trx_country;
    this.trxMcc = data.trx_mcc;
    this.mccDesc = data.MccDesc;
    this.mccGroup = data.MccGroup;
    this.isCardPresent = data.IsCardPresent === 'TRUE';
    this.isPurchase = data.IsPurchase === 'TRUE';
    this.isCash = data.IsCash === 'TRUE';
    this.limitExhaustionCat = data.LimitExhaustion_cat;
  }
}

module.exports = Transaction;