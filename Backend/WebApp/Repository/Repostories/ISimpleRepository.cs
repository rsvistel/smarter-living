using WebApp.Models;

namespace Repository.Repostories;

public interface ISimpleRepository
{
    public Task<List<UserModel>> GetUserAsync();
    public Task<UserModel> CreateUserAsync(string username, string password);
}