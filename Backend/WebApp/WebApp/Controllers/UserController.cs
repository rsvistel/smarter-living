using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Mvc;
using Repository.Repostories;
using WebApp.Models;

namespace WebApp.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UserController(ISimpleRepository repository) : ControllerBase
{
    [HttpGet]
    public async Task<List<UserModel>> GetUsers()
    {
        var users = await repository.GetUserAsync();

        return users;
    }

    [HttpPost]
    public async Task<ActionResult<UserModel>> CreateUser([FromBody] CreateUserRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Username) || string.IsNullOrWhiteSpace(request.Email))
        {
            return BadRequest("Username and email are required");
        }

        var user = await repository.CreateUserAsync(request.Username, request.Email);
        return CreatedAtAction(nameof(GetUsers), new { id = user.Id }, user);
    }

    [HttpPost("detailed")]
    public async Task<ActionResult<UserModel>> CreateDetailedUser([FromBody] CreateDetailedUserRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        if (string.IsNullOrWhiteSpace(request.FirstName) || string.IsNullOrWhiteSpace(request.Email))
        {
            return BadRequest("FirstName and Email are required");
        }

        var preferredCurrency = string.IsNullOrWhiteSpace(request.PreferredCurrency)
            ? "USD"
            : request.PreferredCurrency.Trim().ToUpperInvariant();

        if (preferredCurrency.Length != 3)
        {
            ModelState.AddModelError(nameof(request.PreferredCurrency), "Preferred currency must be a 3-letter ISO code.");
            return ValidationProblem(ModelState);
        }

        var preferredLanguage = string.IsNullOrWhiteSpace(request.PreferredLanguage)
            ? "EN"
            : request.PreferredLanguage.Trim();

        if (preferredLanguage.Length is < 2 or > 5)
        {
            ModelState.AddModelError(nameof(request.PreferredLanguage), "Preferred language must be between 2 and 5 characters.");
            return ValidationProblem(ModelState);
        }

        var userModel = new UserModel
        {
            FirstName = request.FirstName,
            LastName = request.LastName,
            Email = request.Email,
            PhoneNumber = request.PhoneNumber,
            DateOfBirth = request.DateOfBirth,
            Country = request.Country,
            City = request.City,
            Address = request.Address,
            PostalCode = request.PostalCode,
            PreferredCurrency = preferredCurrency,
            PreferredLanguage = preferredLanguage
        };

        var user = await repository.CreateUserAsync(userModel);
        return CreatedAtAction(nameof(GetUser), new { userId = user.Id }, user);
    }

    [HttpGet("{userId}")]
    public async Task<ActionResult<UserModel>> GetUser(int userId)
    {
        var user = await repository.GetUserByIdAsync(userId);
        if (user == null)
        {
            return NotFound($"User with ID {userId} not found");
        }
        return Ok(user);
    }

    [HttpPost("/cards/{userId}")]
    public async Task<ActionResult<UserCardModel>> AddCardToUser(int userId, [FromBody] AddCardRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.CardId) || string.IsNullOrWhiteSpace(request.CardName))
        {
            return BadRequest("CardId and CardName are required");
        }

        try
        {
            var userCard = await repository.AddCardToUserAsync(userId, request.CardId, request.CardName);
            return CreatedAtAction(nameof(GetUserCards), new { userId = userId }, userCard);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpGet("/cards-by-user/{userId}")]
    public async Task<ActionResult<List<UserCardModel>>> GetUserCards(int userId)
    {
        // Check if user exists
        var user = await repository.GetUserByIdAsync(userId);
        if (user == null)
        {
            return NotFound($"User with ID {userId} not found");
        }

        var cards = await repository.GetUserCardsAsync(userId);
        return Ok(cards);
    }

    [HttpGet("{userId}/cards/{cardId}")]
    public async Task<ActionResult<UserCardModel>> GetUserCard(int userId, string cardId)
    {
        var userCard = await repository.GetUserCardAsync(userId, cardId);
        if (userCard == null)
        {
            return NotFound($"Card {cardId} not found for user {userId}");
        }
        return Ok(userCard);
    }

    [HttpDelete("{userId}/cards/{cardId}")]
    public async Task<ActionResult> RemoveCardFromUser(int userId, string cardId)
    {
        var success = await repository.RemoveCardFromUserAsync(userId, cardId);
        if (!success)
        {
            return NotFound($"Card {cardId} not found for user {userId}");
        }
        return NoContent();
    }

    [HttpGet("{userId}/transactions-by-user")]
    public async Task<ActionResult<UserTransactionsByCardsResponse>> GetTransactionsByUser(
        int userId,
        [FromQuery] bool includeInactive = false,
        [FromQuery] DateTime? fromDate = null,
        [FromQuery] DateTime? toDate = null)
    {
        var result = await repository.GetUserTransactionsByCardsAsync(userId, includeInactive, fromDate, toDate);

        if (result == null)
        {
            return NotFound($"User with ID {userId} not found");
        }

        return Ok(result);
    }
}

public class CreateUserRequest
{
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
}

public class CreateDetailedUserRequest
{
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? PhoneNumber { get; set; }
    public DateTime DateOfBirth { get; set; }
    public string Country { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public string? Address { get; set; }
    public string? PostalCode { get; set; }

    [StringLength(3, MinimumLength = 3, ErrorMessage = "Preferred currency must be a 3-letter ISO code.")]
    public string? PreferredCurrency { get; set; }

    [StringLength(5, MinimumLength = 2, ErrorMessage = "Preferred language must be between 2 and 5 characters.")]
    public string? PreferredLanguage { get; set; }
}

public class AddCardRequest
{
    public string CardId { get; set; } = string.Empty;
    public string CardName { get; set; } = string.Empty;
}
