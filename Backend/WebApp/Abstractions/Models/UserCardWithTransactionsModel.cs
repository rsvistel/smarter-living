namespace WebApp.Models;

public class UserCardWithTransactionsModel
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string CardId { get; set; } = string.Empty;
    public string CardName { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public List<TransactionModel> Transactions { get; set; } = new();
    public int TransactionCount => Transactions.Count;
    public decimal TotalAmount => Transactions.Sum(t => t.TransactionAmount);
}