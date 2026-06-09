using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Expade.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddCategoryId : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Businesses_Categories_CategoryId",
                table: "Businesses");

            migrationBuilder.DropForeignKey(
                name: "FK_BusinessRequests_Categories_CategoryId",
                table: "BusinessRequests");

            migrationBuilder.AddForeignKey(
                name: "FK_Businesses_Categories_CategoryId",
                table: "Businesses",
                column: "CategoryId",
                principalTable: "Categories",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_BusinessRequests_Categories_CategoryId",
                table: "BusinessRequests",
                column: "CategoryId",
                principalTable: "Categories",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
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
    }
}
