using Repository.Repostories.Models;
using WebApp.Models;

namespace Repository.Mapper;

public class Mapper : IMapper
{
    public UserModel Map(UserEntity user)
    {
        return new UserModel
        {
            Id = user.Id,
            FirstName = user.FirstName,
            LastName = user.LastName,
            FullName = user.FullName,
            Email = user.Email,
            PhoneNumber = user.PhoneNumber,
            DateOfBirth = user.DateOfBirth,
            Country = user.Country,
            City = user.City,
            Address = user.Address,
            PostalCode = user.PostalCode,
            PreferredCurrency = user.PreferredCurrency,
            PreferredLanguage = user.PreferredLanguage,
            IsActive = user.IsActive,
            CreatedAt = user.CreatedAt,
            UpdatedAt = user.UpdatedAt
        };
    }

    public UserEntity Map(UserModel user)
    {
        return new UserEntity
        {
            Id = user.Id,
            FirstName = user.FirstName,
            LastName = user.LastName,
            Email = user.Email,
            PhoneNumber = user.PhoneNumber,
            DateOfBirth = user.DateOfBirth,
            Country = user.Country,
            City = user.City,
            Address = user.Address,
            PostalCode = user.PostalCode,
            PreferredCurrency = user.PreferredCurrency,
            PreferredLanguage = user.PreferredLanguage,
            IsActive = user.IsActive,
            CreatedAt = user.CreatedAt,
            UpdatedAt = user.UpdatedAt
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

    public UserCardModel Map(UserCardEntity userCard)
    {
        return new UserCardModel
        {
            Id = userCard.Id,
            UserId = userCard.UserId,
            CardId = userCard.CardId,
            CardName = userCard.CardName,
            IsActive = userCard.IsActive,
            CreatedAt = userCard.CreatedAt
        };
    }

    public UserCardEntity Map(UserCardModel userCard)
    {
        return new UserCardEntity
        {
            Id = userCard.Id,
            UserId = userCard.UserId,
            CardId = userCard.CardId,
            CardName = userCard.CardName,
            IsActive = userCard.IsActive,
            CreatedAt = userCard.CreatedAt
        };
    }
}