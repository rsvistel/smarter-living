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

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<UserEntity>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Email).IsRequired().HasMaxLength(255);
            entity.HasIndex(e => e.Email).IsUnique();
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
    }
}