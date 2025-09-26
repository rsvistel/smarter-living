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
        return CreatedAtAction(nameof(GetUsers), new { id = user.Name }, user);
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

    [HttpPost("{userId}/cards")]
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

    [HttpGet("{userId}/cards")]
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

    [HttpGet("{userId}/transactions-by-cards")]
    public async Task<ActionResult<UserTransactionsByCardsResponse>> GetUserTransactionsByCards(
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

public class AddCardRequest
{
    public string CardId { get; set; } = string.Empty;
    public string CardName { get; set; } = string.Empty;
}