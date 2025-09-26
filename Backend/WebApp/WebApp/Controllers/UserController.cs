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
}

public class CreateUserRequest
{
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
}