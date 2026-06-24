using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace Expade.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class ReseedCategoriesAddOther : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("11111111-1111-1111-1111-111111111111"));

            migrationBuilder.DeleteData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("22222222-2222-2222-2222-222222222222"));

            migrationBuilder.DeleteData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("33333333-3333-3333-3333-333333333333"));

            migrationBuilder.DeleteData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("44444444-4444-4444-4444-444444444444"));

            migrationBuilder.InsertData(
                table: "Categories",
                columns: new[] { "Id", "IsActive", "Name" },
                values: new object[,]
                {
                    { new Guid("016ee037-3bc6-4bd4-bef4-8b367272f0e7"), true, "Home Services" },
                    { new Guid("1bb5ca4a-42d6-4b25-9636-8849fd994532"), true, "Automotive Services" },
                    { new Guid("96024af6-27be-4f63-ad04-0f63f28d7175"), true, "Food & Dining" },
                    { new Guid("a2a8e21c-2323-4e88-8bac-013baca03e27"), true, "Beauty & Personal Care" },
                    { new Guid("b20d749f-56b1-41af-910b-85d42f773b82"), true, "Other" }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("016ee037-3bc6-4bd4-bef4-8b367272f0e7"));

            migrationBuilder.DeleteData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("1bb5ca4a-42d6-4b25-9636-8849fd994532"));

            migrationBuilder.DeleteData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("96024af6-27be-4f63-ad04-0f63f28d7175"));

            migrationBuilder.DeleteData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("a2a8e21c-2323-4e88-8bac-013baca03e27"));

            migrationBuilder.DeleteData(
                table: "Categories",
                keyColumn: "Id",
                keyValue: new Guid("b20d749f-56b1-41af-910b-85d42f773b82"));

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
        }
    }
}
