using Microsoft.EntityFrameworkCore;
using Repository.Repostories.Models;

namespace WebApp.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
    {
    }

    public DbSet<UserEntity> Users { get; set; }
    public DbSet<TransactionEntity> Transactions { get; set; }
    public DbSet<UserCardEntity> UserCards { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<UserEntity>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.FirstName).IsRequired().HasMaxLength(100);
            entity.Property(e => e.LastName).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Email).IsRequired().HasMaxLength(255);
            entity.Property(e => e.PhoneNumber).HasMaxLength(20);
            entity.Property(e => e.Country).IsRequired().HasMaxLength(100);
            entity.Property(e => e.City).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Address).HasMaxLength(500);
            entity.Property(e => e.PostalCode).HasMaxLength(20);
            entity.Property(e => e.PreferredCurrency).IsRequired().HasMaxLength(3);
            entity.Property(e => e.PreferredLanguage).IsRequired().HasMaxLength(5);
            entity.Property(e => e.IsActive);

            // Indexes
            entity.HasIndex(e => e.Email).IsUnique();
            entity.HasIndex(e => e.PhoneNumber);
            entity.HasIndex(e => e.Country);
            entity.HasIndex(e => new { e.FirstName, e.LastName });

            // Ignore computed properties
            entity.Ignore(e => e.FullName);
        });

        modelBuilder.Entity<TransactionEntity>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.CardId).IsRequired().HasMaxLength(50);
            entity.Property(e => e.AgeCategory).HasMaxLength(20);
            entity.Property(e => e.TransactionCode).HasMaxLength(20);
            entity.Property(e => e.TransactionAmount).HasPrecision(18, 2);
            entity.Property(e => e.TransactionCurrency).HasMaxLength(10);
            entity.Property(e => e.TransactionDescription).HasMaxLength(500);
            entity.Property(e => e.TransactionCity).HasMaxLength(100);
            entity.Property(e => e.TransactionCountry).HasMaxLength(10);
            entity.Property(e => e.TransactionMcc).HasMaxLength(20);
            entity.Property(e => e.MccDescription).HasMaxLength(500);
            entity.Property(e => e.MccGroup).HasMaxLength(100);
            entity.Property(e => e.LimitExhaustionCategory).HasMaxLength(50);
            entity.HasIndex(e => e.CardId);
            entity.HasIndex(e => e.TransactionDate);
        });

        modelBuilder.Entity<UserCardEntity>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.CardId).IsRequired().HasMaxLength(50);
            entity.Property(e => e.CardName).IsRequired().HasMaxLength(100);
            entity.Property(e => e.IsActive);

            // Foreign key relationship
            entity.HasOne(e => e.User)
                  .WithMany(u => u.UserCards)
                  .HasForeignKey(e => e.UserId)
                  .OnDelete(DeleteBehavior.Cascade);

            // Composite unique index (one card per user)
            entity.HasIndex(e => new { e.UserId, e.CardId }).IsUnique();
            entity.HasIndex(e => e.CardId);
        });
    }
}