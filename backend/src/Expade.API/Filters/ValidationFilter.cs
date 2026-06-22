using FluentValidation;

namespace Expade.API.Filters;

/// <summary>
/// Endpoint filter that validates the first argument of type <typeparamref name="T"/> with its
/// registered FluentValidation validator, returning a 400 ValidationProblem if it fails.
/// </summary>
public class ValidationFilter<T> : IEndpointFilter where T : class
{
    private readonly IValidator<T> _validator;

    public ValidationFilter(IValidator<T> validator) => _validator = validator;

    public async ValueTask<object?> InvokeAsync(EndpointFilterInvocationContext context, EndpointFilterDelegate next)
    {
        var model = context.Arguments.OfType<T>().FirstOrDefault();
        if (model is not null)
        {
            var result = await _validator.ValidateAsync(model);
            if (!result.IsValid)
                return Results.ValidationProblem(result.ToDictionary());
        }

        return await next(context);
    }
}

public static class ValidationFilterExtensions
{
    /// <summary>Attach validation for the request DTO <typeparamref name="T"/> to an endpoint.</summary>
    public static RouteHandlerBuilder WithValidation<T>(this RouteHandlerBuilder builder) where T : class =>
        builder.AddEndpointFilter<ValidationFilter<T>>();
}
