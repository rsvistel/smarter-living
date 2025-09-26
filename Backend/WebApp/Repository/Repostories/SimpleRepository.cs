using Microsoft.EntityFrameworkCore;
using Repository.Mapper;
using Repository.Repostories.Models;
using WebApp.Data;
using WebApp.Models;

namespace Repository.Repostories;

public class SimpleRepository(ApplicationDbContext context, IMapper mapper ) : ISimpleRepository
{
    public async Task<List<UserModel>> GetUserAsync()
    {
        var users = await context.Users.ToListAsync();
        return users.Select(mapper.Map).ToList();
    }

    public async Task<UserModel> CreateUserAsync(string username, string password)
    {
        var userEntity = new UserEntity
        {
            FirstName = username,
            LastName = "",
            Email = password,
            Country = "Unknown",
            City = "Unknown",
            DateOfBirth = DateTime.UtcNow.AddYears(-25), // Default age 25
            CreatedAt = DateTime.UtcNow
        };

        context.Users.Add(userEntity);
        await context.SaveChangesAsync();

        return mapper.Map(userEntity);
    }

    public async Task<UserModel> CreateUserAsync(UserModel user)
    {
        var preferredCurrency = string.IsNullOrWhiteSpace(user.PreferredCurrency)
            ? "USD"
            : user.PreferredCurrency.Trim().ToUpperInvariant();

        if (preferredCurrency.Length != 3)
        {
            throw new ArgumentException("Preferred currency must be a 3-letter ISO code.", nameof(user.PreferredCurrency));
        }

        var preferredLanguage = string.IsNullOrWhiteSpace(user.PreferredLanguage)
            ? "EN"
            : user.PreferredLanguage.Trim();

        if (preferredLanguage.Length is < 2 or > 5)
        {
            throw new ArgumentException("Preferred language must be between 2 and 5 characters.", nameof(user.PreferredLanguage));
        }

        user.PreferredCurrency = preferredCurrency;
        user.PreferredLanguage = preferredLanguage;

        var userEntity = mapper.Map(user);
        userEntity.Id = 0; // Ensure new entity
        userEntity.CreatedAt = DateTime.UtcNow;
        userEntity.UpdatedAt = null;

        context.Users.Add(userEntity);
        await context.SaveChangesAsync();

        return mapper.Map(userEntity);
    }

    public async Task<ImportResult> ImportTransactionsAsync(List<TransactionModel> transactions)
    {
        var result = new ImportResult();
        var errors = new List<string>();

        using var transaction = await context.Database.BeginTransactionAsync();

        try
        {
            foreach (var transactionModel in transactions)
            {
                try
                {
                    var entity = mapper.Map(transactionModel);
                    context.Transactions.Add(entity);
                    result.SuccessCount++;
                }
                catch (Exception ex)
                {
                    result.ErrorCount++;
                    errors.Add($"Failed to import transaction {transactionModel.CardId}: {ex.Message}");
                }
            }

            await context.SaveChangesAsync();
            await transaction.CommitAsync();

            result.Errors = errors;
            return result;
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            throw new InvalidOperationException($"Batch import failed: {ex.Message}");
        }
    }

    public async Task<List<TransactionModel>> GetTransactionsAsync()
    {
        var transactions = await context.Transactions.Where(e => e.Id < 20).ToListAsync();
        return transactions.Select(mapper.Map).ToList();
    }

    public async Task<UserModel?> GetUserByIdAsync(int userId)
    {
        var user = await context.Users.FirstOrDefaultAsync(u => u.Id == userId);
        return user != null ? mapper.Map(user) : null;
    }

    public async Task<UserCardModel> AddCardToUserAsync(int userId, string cardId, string cardName)
    {
        // Check if user exists
        var userExists = await context.Users.AnyAsync(u => u.Id == userId);
        if (!userExists)
        {
            throw new InvalidOperationException($"User with ID {userId} not found");
        }

        // Check if card already exists for this user
        var existingCard = await context.UserCards
            .FirstOrDefaultAsync(uc => uc.UserId == userId && uc.CardId == cardId);

        if (existingCard != null)
        {
            throw new InvalidOperationException($"Card {cardId} already exists for user {userId}");
        }

        var userCard = new UserCardEntity
        {
            UserId = userId,
            CardId = cardId,
            CardName = cardName,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        context.UserCards.Add(userCard);
        await context.SaveChangesAsync();

        return mapper.Map(userCard);
    }

    public async Task<List<UserCardModel>> GetUserCardsAsync(int userId)
    {
        var userCards = await context.UserCards
            .Where(uc => uc.UserId == userId)
            .OrderBy(uc => uc.CreatedAt)
            .ToListAsync();

        return userCards.Select(mapper.Map).ToList();
    }

    public async Task<UserCardModel?> GetUserCardAsync(int userId, string cardId)
    {
        var userCard = await context.UserCards
            .FirstOrDefaultAsync(uc => uc.UserId == userId && uc.CardId == cardId);

        return userCard != null ? mapper.Map(userCard) : null;
    }

    public async Task<bool> RemoveCardFromUserAsync(int userId, string cardId)
    {
        var userCard = await context.UserCards
            .FirstOrDefaultAsync(uc => uc.UserId == userId && uc.CardId == cardId);

        if (userCard == null)
        {
            return false;
        }

        context.UserCards.Remove(userCard);
        await context.SaveChangesAsync();
        return true;
    }

    public async Task<UserTransactionsByCardsResponse?> GetUserTransactionsByCardsAsync(int userId, bool includeInactive = false, DateTime? fromDate = null, DateTime? toDate = null)
    {
        // Get user details
        var user = await context.Users.FirstOrDefaultAsync(u => u.Id == userId);
        if (user == null)
        {
            return null;
        }

        // Get user's cards
        var userCardsQuery = context.UserCards.Where(uc => uc.UserId == userId);
        if (!includeInactive)
        {
            userCardsQuery = userCardsQuery.Where(uc => uc.IsActive);
        }

        var userCards = await userCardsQuery
            .OrderBy(uc => uc.CreatedAt)
            .ToListAsync();

        if (!userCards.Any())
        {
            return new UserTransactionsByCardsResponse
            {
                UserId = userId,
                UserName = user.FullName,
                UserEmail = user.Email,
                Cards = new List<UserCardWithTransactionsModel>(),
                ReportGeneratedAt = DateTime.UtcNow
            };
        }

        // Get card IDs for transaction lookup
        var cardIds = userCards.Select(uc => uc.CardId).ToList();

        // Get transactions for these cards
        var transactionsQuery = context.Transactions.Where(t => cardIds.Contains(t.CardId));

        // Apply date filters if provided
        if (fromDate.HasValue)
        {
            transactionsQuery = transactionsQuery.Where(t => t.TransactionDate >= fromDate.Value);
        }
        if (toDate.HasValue)
        {
            transactionsQuery = transactionsQuery.Where(t => t.TransactionDate <= toDate.Value);
        }

        var transactions = await transactionsQuery
            .OrderByDescending(t => t.TransactionDate)
            .ToListAsync();

        // Group transactions by card
        var transactionsByCard = transactions
            .GroupBy(t => t.CardId)
            .ToDictionary(g => g.Key, g => g.OrderByDescending(t => t.TransactionDate).ToList());

        // Build the response
        var cardsWithTransactions = userCards.Select(card => new UserCardWithTransactionsModel
        {
            Id = card.Id,
            UserId = card.UserId,
            CardId = card.CardId,
            CardName = card.CardName,
            IsActive = card.IsActive,
            CreatedAt = card.CreatedAt,
            Transactions = transactionsByCard.ContainsKey(card.CardId)
                ? transactionsByCard[card.CardId].Select(mapper.Map).ToList()
                : new List<TransactionModel>()
        }).ToList();

        return new UserTransactionsByCardsResponse
        {
            UserId = userId,
            UserName = user.FullName,
            UserEmail = user.Email,
            Cards = cardsWithTransactions,
            ReportGeneratedAt = DateTime.UtcNow
        };
    }
}
