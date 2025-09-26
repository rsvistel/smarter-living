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
            Name = username,
            Email = password,
            CreatedAt = DateTime.UtcNow
        };

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
}