using Expade.API.Contracts.Businesses.Requests;
using Expade.API.Contracts.BusinessRequests.Requests;
using FluentValidation;

namespace Expade.API.Validators;

public class CreateBusinessRequestValidator : AbstractValidator<CreateBusinessRequestRequest>
{
    public CreateBusinessRequestValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(120);
        RuleFor(x => x.Phone).NotEmpty().MaximumLength(30);
        RuleFor(x => x.CategoryId).NotEmpty();
        RuleFor(x => x.Address).NotEmpty().MaximumLength(300);
    }
}

public class CreateServiceValidator : AbstractValidator<CreateServiceRequest>
{
    public CreateServiceValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(120);
        RuleFor(x => x.Price).GreaterThanOrEqualTo(0);
        RuleFor(x => x.DurationInMinutes).GreaterThanOrEqualTo(0);
    }
}

public class UpdateServiceValidator : AbstractValidator<UpdateServiceRequest>
{
    public UpdateServiceValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(120);
        RuleFor(x => x.Price).GreaterThanOrEqualTo(0);
        RuleFor(x => x.DurationInMinutes).GreaterThanOrEqualTo(0);
    }
}

public class UpdateBusinessValidator : AbstractValidator<UpdateBusinessRequest>
{
    public UpdateBusinessValidator()
    {
        RuleFor(x => x.Phone).NotEmpty().MaximumLength(30);
        RuleFor(x => x.Description).MaximumLength(2000);
        RuleFor(x => x.ServiceRadiusMiles).InclusiveBetween(1, 100);
    }
}

public class CreateBusinessFromRequestValidator : AbstractValidator<CreateBusinessFromRequest>
{
    public CreateBusinessFromRequestValidator()
    {
        RuleFor(x => x.RequestId).NotEmpty();
        RuleFor(x => x.Description).NotEmpty().MaximumLength(2000);
        RuleFor(x => x.Hours).NotEmpty();
        RuleForEach(x => x.Services).ChildRules(s =>
        {
            s.RuleFor(i => i.Name).NotEmpty().MaximumLength(120);
            s.RuleFor(i => i.Price).GreaterThanOrEqualTo(0);
            s.RuleFor(i => i.DurationInMinutes).GreaterThanOrEqualTo(0);
        });
        RuleForEach(x => x.Workers).ChildRules(w =>
            w.RuleFor(i => i.Email).NotEmpty().EmailAddress());
    }
}

public class CreateBlockedTimeValidator : AbstractValidator<CreateBlockedTimeRequest>
{
    public CreateBlockedTimeValidator()
    {
        RuleFor(x => x.Start).NotEmpty();
        RuleFor(x => x.End).NotEmpty();
        RuleFor(x => x.Reason).MaximumLength(80);
    }
}
