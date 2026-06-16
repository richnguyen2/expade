namespace Expade.API.Contracts.BusinessesRequests.Responses;

public class BusinessRequestOnboardResponse 
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public Guid CategoryId{ get; set; }
    public string CategoryName { get; set; } = string.Empty;
}

