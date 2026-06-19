using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Expade.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddBusinessTimeZone : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "TimeZoneId",
                table: "BusinessRequests",
                type: "text",
                nullable: false,
                defaultValue: "America/New_York");

            migrationBuilder.AddColumn<string>(
                name: "TimeZoneId",
                table: "Businesses",
                type: "text",
                nullable: false,
                defaultValue: "America/New_York");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "TimeZoneId",
                table: "BusinessRequests");

            migrationBuilder.DropColumn(
                name: "TimeZoneId",
                table: "Businesses");
        }
    }
}
