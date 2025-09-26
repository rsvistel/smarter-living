namespace Repository.Repostories.Models;

public class UserCardEntity
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string CardId { get; set; } = string.Empty;
    public string CardName { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public UserEntity User { get; set; } = null!;
}