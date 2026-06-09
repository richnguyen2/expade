using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace Expade.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class PhoneAndCategoryEntitiy : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Category",
                table: "BusinessRequests");

            migrationBuilder.RenameColumn(
                name: "Description",
                table: "BusinessRequests",
                newName: "Phone");

            migrationBuilder.RenameColumn(
                name: "Category",
                table: "Businesses",
                newName: "Phone");

            migrationBuilder.AddColumn<Guid>(
                name: "CategoryId",
                table: "BusinessRequests",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.AddColumn<Guid>(
                name: "CategoryId",
                table: "Businesses",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.CreateTable(
                name: "Categories",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "text", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Categories", x => x.Id);
                });

            migrationBuilder.InsertData(
                table: "Categories",
                columns: new[] { "Id", "IsActive", "Name" },
                values: new object[,]
                {
                    { new Guid("11111111-1111-1111-1111-111111111111"), true, "Beauty & Personal Care" },
                    { new Guid("22222222-2222-2222-2222-222222222222"), true, "Home Services" },
                    { new Guid("33333333-3333-3333-3333-333333333333"), true, "Automotive Services" },
                    { new Guid("44444444-4444-4444-4444-444444444444"), true, "Food & Dining" }
                });

            migrationBuilder.CreateIndex(
                name: "IX_BusinessRequests_CategoryId",
                table: "BusinessRequests",
                column: "CategoryId");

            migrationBuilder.CreateIndex(
                name: "IX_Businesses_CategoryId",
                table: "Businesses",
                column: "CategoryId");

            migrationBuilder.AddForeignKey(
                name: "FK_Businesses_Categories_CategoryId",
                table: "Businesses",
                column: "CategoryId",
                principalTable: "Categories",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_BusinessRequests_Categories_CategoryId",
                table: "BusinessRequests",
                column: "CategoryId",
                principalTable: "Categories",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Businesses_Categories_CategoryId",
                table: "Businesses");

            migrationBuilder.DropForeignKey(
                name: "FK_BusinessRequests_Categories_CategoryId",
                table: "BusinessRequests");

            migrationBuilder.DropTable(
                name: "Categories");

            migrationBuilder.DropIndex(
                name: "IX_BusinessRequests_CategoryId",
                table: "BusinessRequests");

            migrationBuilder.DropIndex(
                name: "IX_Businesses_CategoryId",
                table: "Businesses");

            migrationBuilder.DropColumn(
                name: "CategoryId",
                table: "BusinessRequests");

            migrationBuilder.DropColumn(
                name: "CategoryId",
                table: "Businesses");

            migrationBuilder.RenameColumn(
                name: "Phone",
                table: "BusinessRequests",
                newName: "Description");

            migrationBuilder.RenameColumn(
                name: "Phone",
                table: "Businesses",
                newName: "Category");

            migrationBuilder.AddColumn<string>(
                name: "Category",
                table: "BusinessRequests",
                type: "text",
                nullable: false,
                defaultValue: "");
        }
    }
}
