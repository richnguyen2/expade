namespace Expade.Application.Exceptions;

/// <summary>
/// Base for expected, business-level failures. Application services throw these instead of
/// returning HTTP results; the API's global exception handler maps each to a status code.
/// </summary>
public abstract class AppException : Exception
{
    protected AppException(string message) : base(message) { }
}

/// <summary>A requested resource does not exist → 404.</summary>
public sealed class NotFoundException : AppException
{
    public NotFoundException(string message) : base(message) { }
}

/// <summary>The caller is authenticated but not allowed to do this → 403.</summary>
public sealed class ForbiddenException : AppException
{
    public ForbiddenException(string message = "You are not allowed to perform this action.") : base(message) { }
}

/// <summary>A business rule was violated (bad input/state) → 400.</summary>
public sealed class ValidationException : AppException
{
    public ValidationException(string message) : base(message) { }
}

/// <summary>The action conflicts with current state (e.g. duplicate) → 409.</summary>
public sealed class ConflictException : AppException
{
    public ConflictException(string message) : base(message) { }
}
