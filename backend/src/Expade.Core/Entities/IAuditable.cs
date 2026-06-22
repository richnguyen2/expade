namespace Expade.Core.Entities;

/// <summary>Entities whose <see cref="UpdatedAt"/> is auto-stamped on insert/update by AppDbContext.</summary>
public interface IAuditable
{
    DateTime UpdatedAt { get; set; }
}
