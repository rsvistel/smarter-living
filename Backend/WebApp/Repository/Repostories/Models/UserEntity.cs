namespace Repository.Repostories.Models;

public class UserEntity
{
    public int Id { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? PhoneNumber { get; set; }
    public DateTime DateOfBirth { get; set; }
    public string Country { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string? Address { get; set; }
    public string? PostalCode { get; set; }
    public string PreferredCurrency { get; set; } = "USD";
    public string PreferredLanguage { get; set; } = "EN";
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }

    // Computed property for full name
    public string FullName => $"{FirstName} {LastName}".Trim();

    // Navigation properties
    public List<UserCardEntity> UserCards { get; set; } = new();
}