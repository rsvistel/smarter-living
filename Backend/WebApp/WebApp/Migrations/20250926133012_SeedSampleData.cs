using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WebApp.Migrations
{
    /// <inheritdoc />
    public partial class SeedSampleData : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Insert sample users with comprehensive information
            migrationBuilder.InsertData(
                table: "Users",
                columns: new[] { "FirstName", "LastName", "Email", "PhoneNumber", "DateOfBirth", "Country", "City", "Address", "PostalCode", "PreferredCurrency", "PreferredLanguage", "IsActive", "CreatedAt" },
                values: new object[,]
                {
                    { "John", "Smith", "john.smith@email.com", "+1-555-0101", new DateTime(1985, 3, 15, 0, 0, 0, DateTimeKind.Utc), "United States", "New York", "123 Broadway Ave", "10001", "USD", "EN", true, DateTime.UtcNow.AddDays(-30) },
                    { "Maria", "Garcia", "maria.garcia@email.com", "+1-555-0102", new DateTime(1990, 7, 22, 0, 0, 0, DateTimeKind.Utc), "United States", "Los Angeles", "456 Sunset Blvd", "90210", "USD", "ES", true, DateTime.UtcNow.AddDays(-25) },
                    { "David", "Chen", "david.chen@email.com", "+1-555-0103", new DateTime(1988, 11, 8, 0, 0, 0, DateTimeKind.Utc), "Canada", "Toronto", "789 King Street", "M5V 1J5", "CAD", "EN", true, DateTime.UtcNow.AddDays(-20) },
                    { "Sophie", "Mueller", "sophie.mueller@email.com", "+49-30-12345678", new DateTime(1992, 4, 3, 0, 0, 0, DateTimeKind.Utc), "Germany", "Berlin", "Unter den Linden 1", "10117", "EUR", "DE", true, DateTime.UtcNow.AddDays(-15) },
                    { "Takeshi", "Tanaka", "takeshi.tanaka@email.com", "+81-3-1234-5678", new DateTime(1987, 9, 12, 0, 0, 0, DateTimeKind.Utc), "Japan", "Tokyo", "1-1-1 Shibuya", "150-0002", "JPY", "JA", true, DateTime.UtcNow.AddDays(-10) }
                }
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Remove sample data in reverse order
            migrationBuilder.DeleteData(
                table: "Users",
                keyColumn: "Email",
                keyValues: new object[] { "john.smith@email.com", "maria.garcia@email.com", "david.chen@email.com", "sophie.mueller@email.com", "takeshi.tanaka@email.com" }
            );
        }
    }
}
