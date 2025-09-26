using WebApp.Models;

namespace Repository.Repostories;

public interface ISimpleRepository
{
    public Task<List<UserModel>> GetUserAsync();
    public Task<UserModel> CreateUserAsync(string username, string password);
    public Task<UserModel> CreateUserAsync(UserModel user);
    public Task<ImportResult> ImportTransactionsAsync(List<TransactionModel> transactions);
    public Task<List<TransactionModel>> GetTransactionsAsync();

    // User Cards methods
    public Task<UserCardModel> AddCardToUserAsync(int userId, string cardId, string cardName);
    public Task<List<UserCardModel>> GetUserCardsAsync(int userId);
    public Task<UserCardModel?> GetUserCardAsync(int userId, string cardId);
    public Task<bool> RemoveCardFromUserAsync(int userId, string cardId);
    public Task<UserModel?> GetUserByIdAsync(int userId);
    public Task<UserTransactionsByCardsResponse?> GetUserTransactionsByCardsAsync(int userId, bool includeInactive = false, DateTime? fromDate = null, DateTime? toDate = null);
}