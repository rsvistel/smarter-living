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

    public TransactionModel Map(TransactionEntity transaction)
    {
        return new TransactionModel
        {
            CardId = transaction.CardId,
            AgeCategory = transaction.AgeCategory,
            TransactionDate = transaction.TransactionDate,
            TransactionCode = transaction.TransactionCode,
            TransactionAmount = transaction.TransactionAmount,
            TransactionCurrency = transaction.TransactionCurrency,
            TransactionDescription = transaction.TransactionDescription,
            TransactionCity = transaction.TransactionCity,
            TransactionCountry = transaction.TransactionCountry,
            TransactionMcc = transaction.TransactionMcc,
            MccDescription = transaction.MccDescription,
            MccGroup = transaction.MccGroup,
            IsCardPresent = transaction.IsCardPresent,
            IsPurchase = transaction.IsPurchase,
            IsCash = transaction.IsCash,
            LimitExhaustionCategory = transaction.LimitExhaustionCategory
        };
    }

    public TransactionEntity Map(TransactionModel transaction)
    {
        return new TransactionEntity
        {
            CardId = transaction.CardId,
            AgeCategory = transaction.AgeCategory,
            TransactionDate = transaction.TransactionDate,
            TransactionCode = transaction.TransactionCode,
            TransactionAmount = transaction.TransactionAmount,
            TransactionCurrency = transaction.TransactionCurrency,
            TransactionDescription = transaction.TransactionDescription,
            TransactionCity = transaction.TransactionCity,
            TransactionCountry = transaction.TransactionCountry,
            TransactionMcc = transaction.TransactionMcc,
            MccDescription = transaction.MccDescription,
            MccGroup = transaction.MccGroup,
            IsCardPresent = transaction.IsCardPresent,
            IsPurchase = transaction.IsPurchase,
            IsCash = transaction.IsCash,
            LimitExhaustionCategory = transaction.LimitExhaustionCategory,
            CreatedAt = DateTime.UtcNow
        };
    }
}