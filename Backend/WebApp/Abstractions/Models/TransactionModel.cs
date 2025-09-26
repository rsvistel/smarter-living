namespace WebApp.Models;

public class TransactionModel
{
    public string CardId { get; set; } = string.Empty;
    public string AgeCategory { get; set; } = string.Empty;
    public DateTime TransactionDate { get; set; }
    public string TransactionCode { get; set; } = string.Empty;
    public decimal TransactionAmount { get; set; }
    public string TransactionCurrency { get; set; } = string.Empty;
    public string TransactionDescription { get; set; } = string.Empty;
    public string TransactionCity { get; set; } = string.Empty;
    public string TransactionCountry { get; set; } = string.Empty;
    public string TransactionMcc { get; set; } = string.Empty;
    public string MccDescription { get; set; } = string.Empty;
    public string MccGroup { get; set; } = string.Empty;
    public bool IsCardPresent { get; set; }
    public bool IsPurchase { get; set; }
    public bool IsCash { get; set; }
    public string LimitExhaustionCategory { get; set; } = string.Empty;
}