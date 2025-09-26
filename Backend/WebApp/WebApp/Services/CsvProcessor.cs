using System.Globalization;
using WebApp.Models;

namespace WebApp.Services;

public static class CsvProcessor
{
    public static (List<TransactionModel> transactions, List<string> errors) ParseCsvFile(Stream csvStream)
    {
        var transactions = new List<TransactionModel>();
        var errors = new List<string>();

        using var reader = new StreamReader(csvStream);

        // Read header line
        var headerLine = reader.ReadLine();
        if (string.IsNullOrEmpty(headerLine))
        {
            throw new InvalidOperationException("CSV file is empty");
        }

        var expectedHeaders = new[]
        {
            "CardId", "Age_cat", "trx_date", "trx_code", "trx_amount", "trx_currency",
            "trx_desc", "trx_city", "trx_country", "trx_mcc", "MccDesc", "MccGroup",
            "IsCardPresent", "IsPurchase", "IsCash", "LimitExhaustion_cat"
        };

        var headers = ParseCsvLine(headerLine);
        if (!ValidateHeaders(headers, expectedHeaders))
        {
            throw new InvalidOperationException("CSV headers do not match expected format");
        }

        // Read data lines
        string line;
        int lineNumber = 2;
        while ((line = reader.ReadLine()) != null)
        {
            if (string.IsNullOrWhiteSpace(line)) continue;

            try
            {
                var values = ParseCsvLine(line);
                if (values.Length != expectedHeaders.Length)
                {
                    errors.Add($"Line {lineNumber}: Expected {expectedHeaders.Length} columns, found {values.Length}");
                    lineNumber++;
                    continue;
                }

                var transaction = ParseTransactionFromValues(values);
                ValidateTransaction(transaction);
                transactions.Add(transaction);
            }
            catch (Exception ex)
            {
                errors.Add($"Line {lineNumber}: {ex.Message}");
            }

            lineNumber++;
        }

        return (transactions, errors);
    }

    private static string[] ParseCsvLine(string line)
    {
        var values = new List<string>();
        var inQuotes = false;
        var currentValue = "";

        for (int i = 0; i < line.Length; i++)
        {
            char c = line[i];

            if (c == '"')
            {
                inQuotes = !inQuotes;
            }
            else if (c == ',' && !inQuotes)
            {
                values.Add(currentValue.Trim());
                currentValue = "";
            }
            else
            {
                currentValue += c;
            }
        }

        values.Add(currentValue.Trim());
        return values.ToArray();
    }

    private static bool ValidateHeaders(string[] actualHeaders, string[] expectedHeaders)
    {
        if (actualHeaders.Length != expectedHeaders.Length)
            return false;

        for (int i = 0; i < expectedHeaders.Length; i++)
        {
            if (!string.Equals(actualHeaders[i].Trim(), expectedHeaders[i], StringComparison.OrdinalIgnoreCase))
                return false;
        }

        return true;
    }

    private static TransactionModel ParseTransactionFromValues(string[] values)
    {
        var transactionDate = DateTime.ParseExact(values[2], "yyyy-MM-dd", CultureInfo.InvariantCulture);

        return new TransactionModel
        {
            CardId = values[0],
            AgeCategory = values[1],
            TransactionDate = DateTime.SpecifyKind(transactionDate, DateTimeKind.Utc),
            TransactionCode = values[3],
            TransactionAmount = decimal.Parse(values[4], CultureInfo.InvariantCulture),
            TransactionCurrency = values[5],
            TransactionDescription = values[6],
            TransactionCity = values[7],
            TransactionCountry = values[8],
            TransactionMcc = values[9],
            MccDescription = values[10],
            MccGroup = values[11],
            IsCardPresent = ParseBoolean(values[12]),
            IsPurchase = ParseBoolean(values[13]),
            IsCash = ParseBoolean(values[14]),
            LimitExhaustionCategory = values[15]
        };
    }

    private static bool ParseBoolean(string value)
    {
        return string.Equals(value.Trim(), "TRUE", StringComparison.OrdinalIgnoreCase);
    }

    private static void ValidateTransaction(TransactionModel transaction)
    {
        if (string.IsNullOrWhiteSpace(transaction.CardId))
            throw new ArgumentException("CardId is required");

        // Allow negative amounts for refunds/reversals

        if (transaction.TransactionDate == default(DateTime))
            throw new ArgumentException("Valid transaction date is required");
    }
}