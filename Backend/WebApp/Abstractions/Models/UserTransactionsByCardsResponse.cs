namespace WebApp.Models;

public class UserTransactionsByCardsResponse
{
    public int UserId { get; set; }
    public string UserName { get; set; } = string.Empty;
    public string UserEmail { get; set; } = string.Empty;
    public List<UserCardWithTransactionsModel> Cards { get; set; } = new();
    public int TotalTransactions => Cards.Sum(c => c.TransactionCount);
    public decimal TotalAmount => Cards.Sum(c => c.TotalAmount);
    public int ActiveCardsCount => Cards.Count(c => c.IsActive);
    public DateTime ReportGeneratedAt { get; set; } = DateTime.UtcNow;
}