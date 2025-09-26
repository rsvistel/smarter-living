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
        var transactions = await context.Transactions.ToListAsync();
        return transactions.Select(mapper.Map).ToList();
    }
}