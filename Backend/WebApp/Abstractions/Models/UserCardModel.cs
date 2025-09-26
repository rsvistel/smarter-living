namespace WebApp.Models;

public class UserCardModel
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string CardId { get; set; } = string.Empty;
    public string CardName { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
}