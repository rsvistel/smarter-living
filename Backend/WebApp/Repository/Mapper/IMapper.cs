using Repository.Repostories.Models;
using WebApp.Models;

namespace Repository.Mapper;

public interface IMapper
{
    UserModel Map(UserEntity user);
    UserEntity Map(UserModel user);
    TransactionModel Map(TransactionEntity transaction);
    TransactionEntity Map(TransactionModel transaction);
    UserCardModel Map(UserCardEntity userCard);
    UserCardEntity Map(UserCardModel userCard);
}