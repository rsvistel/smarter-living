namespace Repository.Repostories.Models;

public class UserEntity
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    public List<UserCardEntity> UserCards { get; set; } = new();
}