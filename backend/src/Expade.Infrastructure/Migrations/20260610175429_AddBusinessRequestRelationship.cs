using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Expade.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddBusinessRequestRelationship : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "RequestId",
                table: "Businesses",
                type: "uuid",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.CreateIndex(
                name: "IX_Businesses_RequestId",
                table: "Businesses",
                column: "RequestId",
                unique: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Businesses_BusinessRequests_RequestId",
                table: "Businesses",
                column: "RequestId",
                principalTable: "BusinessRequests",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Businesses_BusinessRequests_RequestId",
                table: "Businesses");

            migrationBuilder.DropIndex(
                name: "IX_Businesses_RequestId",
                table: "Businesses");

            migrationBuilder.DropColumn(
                name: "RequestId",
                table: "Businesses");
        }
    }
}
