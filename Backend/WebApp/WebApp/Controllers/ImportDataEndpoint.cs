using Microsoft.AspNetCore.Mvc;
using Repository.Repostories;
using WebApp.Models;
using WebApp.Services;

namespace WebApp.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ImportController(ISimpleRepository repository) : ControllerBase
{
    [HttpPost("transactions")]
    public async Task<ActionResult<ImportResult>> ImportTransactions(IFormFile file)
    {
        if (file == null || file.Length == 0)
        {
            return BadRequest("No file provided");
        }

        if (!file.FileName.EndsWith(".csv", StringComparison.OrdinalIgnoreCase))
        {
            return BadRequest("Only CSV files are supported");
        }

        try
        {
            using var stream = file.OpenReadStream();
            var (transactions, parseErrors) = CsvProcessor.ParseCsvFile(stream);
            var result = await repository.ImportTransactionsAsync(transactions);

            // Add parse errors to the result
            result.Errors.AddRange(parseErrors);
            result.ErrorCount += parseErrors.Count;

            return Ok(result);
        }
        catch (Exception ex)
        {
            return BadRequest($"Import failed: {ex.Message}");
        }
    }

    [HttpGet("transactions")]
    public async Task<ActionResult<List<TransactionModel>>> GetTransactions()
    {
        var transactions = await repository.GetTransactionsAsync();
        return Ok(transactions);
    }
}