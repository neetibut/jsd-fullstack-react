import { Link, useRouteError, isRouteErrorResponse } from "react-router-dom";

// Catch-all for unknown URLs and for anything a route throws. Without this,
// React Router falls back to its built-in developer error screen ("Hey
// developer 👋"), which is not something a visitor should ever see.
export default function NotFound() {
  const error = useRouteError();
  const is404 = !error || (isRouteErrorResponse(error) && error.status === 404);

  return (
    <div className="min-h-screen w-full p-6 flex flex-col items-center gap-y-4 pt-24">
      <h1 className="text-5xl font-extrabold">{is404 ? "404" : "Something went wrong"}</h1>
      <p className="text-xl">
        {is404
          ? "We couldn't find that page."
          : "An unexpected error occurred. Try again, or head back home."}
      </p>
      <Link
        to="/"
        className="mt-2 bg-sky-500 hover:bg-sky-600 text-white px-4 py-2 rounded"
      >
        Back to Home
      </Link>
    </div>
  );
}
