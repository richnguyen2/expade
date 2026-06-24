using Expade.API.Contracts.Businesses.Requests;
using Expade.API.Contracts.BusinessRequests.Requests;
using Expade.API.Validators;
using FluentValidation.TestHelper;

namespace Expade.Tests;

public class ValidatorTests
{
    [Fact]
    public void CreateService_RejectsNegativePriceAndEmptyName()
    {
        var result = new CreateServiceValidator().TestValidate(
            new CreateServiceRequest(Name: "", Description: "", Price: -1, DurationInMinutes: -5));

        result.ShouldHaveValidationErrorFor(x => x.Name);
        result.ShouldHaveValidationErrorFor(x => x.Price);
        result.ShouldHaveValidationErrorFor(x => x.DurationInMinutes);
    }

    [Fact]
    public void CreateService_AcceptsValidInput()
    {
        var result = new CreateServiceValidator().TestValidate(
            new CreateServiceRequest(Name: "Haircut", Description: "A cut", Price: 30, DurationInMinutes: 30));

        result.ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public void CreateBusinessRequest_RequiresAllFields()
    {
        var result = new CreateBusinessRequestValidator().TestValidate(
            new CreateBusinessRequestRequest(Name: "", Phone: "", CategoryId: Guid.Empty, Address: ""));

        result.ShouldHaveValidationErrorFor(x => x.Name);
        result.ShouldHaveValidationErrorFor(x => x.Phone);
        result.ShouldHaveValidationErrorFor(x => x.CategoryId);
        result.ShouldHaveValidationErrorFor(x => x.Address);
    }

    [Fact]
    public void CreateBusinessRequest_AcceptsValidInput()
    {
        var result = new CreateBusinessRequestValidator().TestValidate(
            new CreateBusinessRequestRequest("Acme", "(555) 123-4567", Guid.NewGuid(), "123 Main St, Springfield"));

        result.ShouldNotHaveAnyValidationErrors();
    }

    [Fact]
    public void CreateBlockedTime_ValidatesTimesAndReasonLength()
    {
        var result = new CreateBlockedTimeValidator().TestValidate(
            new CreateBlockedTimeRequest(new DateOnly(2026, 6, 1), Start: "", End: "", Reason: new string('x', 200)));

        result.ShouldHaveValidationErrorFor(x => x.Start);
        result.ShouldHaveValidationErrorFor(x => x.End);
        result.ShouldHaveValidationErrorFor(x => x.Reason);
    }

    [Fact]
    public void CreateBusinessFromRequest_RequiresHoursAndValidWorkerEmails()
    {
        var contract = new CreateBusinessFromRequest(
            RequestId: Guid.NewGuid(),
            Description: "We do things",
            Services: [],
            Workers: [new WorkerInput("not-an-email")],
            Hours: []);

        var result = new CreateBusinessFromRequestValidator().TestValidate(contract);

        result.ShouldHaveValidationErrorFor(x => x.Hours);
        result.ShouldHaveValidationErrorFor("Workers[0].Email");
    }
}
