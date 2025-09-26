using Repository.Repostories.Models;
using WebApp.Models;

namespace Repository.Mapper;

public class Mapper : IMapper
{
    public UserModel Map(UserEntity user)
    {
        return new UserModel
        {
            Name = user.Name,
            Email = user.Email
        };
    }

    public UserEntity Map(UserModel user)
    {
        return new UserEntity
        {
            Name = user.Name,
            Email = user.Email,
            CreatedAt = DateTime.UtcNow
        };
    }
}