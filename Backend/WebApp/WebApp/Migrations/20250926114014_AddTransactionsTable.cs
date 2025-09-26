using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace WebApp.Migrations
{
    /// <inheritdoc />
    public partial class AddTransactionsTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Transactions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    CardId = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    AgeCategory = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    TransactionDate = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    TransactionCode = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    TransactionAmount = table.Column<decimal>(type: "numeric(18,2)", precision: 18, scale: 2, nullable: false),
                    TransactionCurrency = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    TransactionDescription = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    TransactionCity = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    TransactionCountry = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    TransactionMcc = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    MccDescription = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: false),
                    MccGroup = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    IsCardPresent = table.Column<bool>(type: "boolean", nullable: false),
                    IsPurchase = table.Column<bool>(type: "boolean", nullable: false),
                    IsCash = table.Column<bool>(type: "boolean", nullable: false),
                    LimitExhaustionCategory = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Transactions", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Transactions_CardId",
                table: "Transactions",
                column: "CardId");

            migrationBuilder.CreateIndex(
                name: "IX_Transactions_TransactionDate",
                table: "Transactions",
                column: "TransactionDate");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Transactions");
        }
    }
}
