namespace Expade.API.Contracts.Businesses.Requests;

/// <summary>Replaces a business's full weekly hours (expects all 7 days). Reuses BusinessHoursInput.</summary>
public record UpdateBusinessHoursRequest(List<BusinessHoursInput> Hours);
