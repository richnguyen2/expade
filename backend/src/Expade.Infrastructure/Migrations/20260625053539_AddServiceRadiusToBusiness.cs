using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Expade.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddServiceRadiusToBusiness : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Default 10 so existing businesses are discoverable with a sensible service radius.
            migrationBuilder.AddColumn<int>(
                name: "ServiceRadiusMiles",
                table: "Businesses",
                type: "integer",
                nullable: false,
                defaultValue: 10);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ServiceRadiusMiles",
                table: "Businesses");
        }
    }
}
