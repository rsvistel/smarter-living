using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WebApp.Migrations
{
    /// <inheritdoc />
    public partial class SeedSampleCards : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Insert sample cards for users (assuming user IDs 1-5 from previous migration)
            migrationBuilder.InsertData(
                table: "UserCards",
                columns: new[] { "UserId", "CardId", "CardName", "IsActive", "CreatedAt" },
                values: new object[,]
                {
                    // John Smith's cards
                    { 1, "4302MAHICMDU4149", "John's Visa Credit", true, DateTime.UtcNow.AddDays(-25) },
                    { 1, "5555555555554444", "John's Mastercard Debit", true, DateTime.UtcNow.AddDays(-20) },

                    // Maria Garcia's cards
                    { 2, "4111111111111111", "Maria's Travel Card", true, DateTime.UtcNow.AddDays(-22) },
                    { 2, "5105105105105100", "Maria's Business Card", true, DateTime.UtcNow.AddDays(-18) },

                    // David Chen's cards
                    { 3, "4000000000000002", "David's Premium Visa", true, DateTime.UtcNow.AddDays(-15) },
                    { 3, "5200000000000007", "David's Rewards Card", true, DateTime.UtcNow.AddDays(-12) },

                    // Sophie Mueller's cards
                    { 4, "4242424242424242", "Sophie's Euro Card", true, DateTime.UtcNow.AddDays(-10) },

                    // Takeshi Tanaka's cards
                    { 5, "4012888888881881", "Takeshi's JCB Card", true, DateTime.UtcNow.AddDays(-8) },
                    { 5, "5555555555554445", "Takeshi's Corporate Card", true, DateTime.UtcNow.AddDays(-5) }
                }
            );
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Remove sample cards
            migrationBuilder.DeleteData(
                table: "UserCards",
                keyColumn: "CardId",
                keyValues: new object[] {
                    "4302MAHICMDU4149", "5555555555554444", "4111111111111111", "5105105105105100",
                    "4000000000000002", "5200000000000007", "4242424242424242", "4012888888881881", "5555555555554445"
                }
            );
        }
    }
}
