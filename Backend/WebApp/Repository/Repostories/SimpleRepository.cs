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
}