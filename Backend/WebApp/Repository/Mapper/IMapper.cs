using Repository.Repostories.Models;
using WebApp.Models;

namespace Repository.Mapper;

public interface IMapper
{
    UserModel Map(UserEntity user);
    UserEntity Map(UserModel user);
}