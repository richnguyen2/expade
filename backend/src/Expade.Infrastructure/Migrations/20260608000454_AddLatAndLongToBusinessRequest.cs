using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Expade.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddLatAndLongToBusinessRequest : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<double>(
                name: "Latitude",
                table: "BusinessRequests",
                type: "double precision",
                nullable: false,
                defaultValue: 0.0);

            migrationBuilder.AddColumn<double>(
                name: "Longitude",
                table: "BusinessRequests",
                type: "double precision",
                nullable: false,
                defaultValue: 0.0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Latitude",
                table: "BusinessRequests");

            migrationBuilder.DropColumn(
                name: "Longitude",
                table: "BusinessRequests");
        }
    }
}
