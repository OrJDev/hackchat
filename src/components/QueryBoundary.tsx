import { A } from "@solidjs/router";
import type { CreateQueryResult } from "@tanstack/solid-query";
import type { JSX } from "solid-js";
import { ErrorBoundary, Match, Suspense, Switch } from "solid-js";

export interface QueryBoundaryProps<T = unknown> {
  query: CreateQueryResult<T, Error>;

  /**
   * Triggered when the data is initially loading.
   */
  loadingFallback?: JSX.Element;

  /**
   * Triggered when fetching is complete, but the returned data was falsey.
   */
  notFoundFallback?: JSX.Element;

  /**
   * Triggered when the query results in an error.
   */
  errorFallback?: (err: Error, retry: () => void) => JSX.Element;

  /**
   * Triggered when fetching is complete, and the returned data is not falsey.
   */
  children: (data: Exclude<T, null | false | undefined>) => JSX.Element;
}

/**
 * Convenience wrapper that handles suspense and errors for queries. Makes the results of query.data available to
 * children (as a render prop) in a type-safe way.
 */
export function QueryBoundary<T>(props: QueryBoundaryProps<T>) {
  return (
    <Suspense fallback={props.loadingFallback}>
      <ErrorBoundary
        fallback={(err: Error, reset) =>
          props.errorFallback ? (
            props.errorFallback(err, async () => {
              await props.query.refetch();
              reset();
            })
          ) : (
            <>
              <div class="flex flex-col self-center justify-self-center gap-2 items-center w-[70vw] sm:w-[400px]">
                <div class="font-bold text-red-500 text-xl bg-zinc-900 rounded-lg p-3 flex items-center justify-center my-12">
                  <p>{err.message ?? "Something Went Wrong"}</p>
                </div>
                <A
                  href="/dashboard"
                  class="disabled:animate-pulse hover:bg-zinc-700 disabled:bg-opacity-50 text-red-500 font-bold transition-all text-sm w-28 h-12 rounded-lg p-3 flex items-center justify-center"
                  style={{
                    "box-shadow": `0 0 0 1px #555`,
                  }}
                >
                  Go Home
                </A>
              </div>
            </>
          )
        }
      >
        <Switch>
          {/* <Match when={props.query.isError}>
              {props.errorFallback ? (
                props.errorFallback
              ) : (
                <div>
                  <div class="error">{props.query.error?.message}</div>
                  <button
                    onClick={() => {
                      props.query.refetch();
                    }}
                  >
                    retry
                  </button>
                </div>
              )}
            </Match> */}

          <Match when={!props.query.isFetching && !props.query.data}>
            {props.notFoundFallback ? (
              props.notFoundFallback
            ) : (
              <div>not found</div>
            )}
          </Match>

          <Match when={props.query.data}>
            {props.children(
              props.query.data as Exclude<T, null | false | undefined>
            )}
          </Match>
        </Switch>
      </ErrorBoundary>
    </Suspense>
  );
}
