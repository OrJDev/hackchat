// @refresh reload
import "./styles/app.css";
import { Meta, MetaProvider, Title } from "@solidjs/meta";
import { Router, useLocation } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { ErrorBoundary, ParentComponent, Suspense } from "solid-js";
import { QueryClient, QueryClientProvider } from "@tanstack/solid-query";
import { SessionProvider } from "@solid-mediakit/auth/client";
import { Toaster } from "solid-toast";
import { NavBar } from "./components";
import { ContactsProvider } from "./utils/contacts";

export default function App() {
  const queryClient = new QueryClient();
  return (
    <Router
      root={(props) => (
        <MetaProvider>
          <Meta
            name="viewport"
            content="width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1, user-scalable=no"
          />
          <Meta name="theme-color" content="#a855f7" />
          <Title>HackChat</Title>
          <SessionProvider>
            <QueryClientProvider client={queryClient}>
              <Suspense>
                <ContactsProvider>
                  <NavBar />
                  <WithStyling>{props.children}</WithStyling>
                  <Toaster
                    toastOptions={{
                      position: "top-right",
                      style: {
                        "background-color": "#24292e",
                        color: "white",
                        "font-weight": "500",
                      },
                      unmountDelay: 1000,
                    }}
                  />
                </ContactsProvider>
              </Suspense>
            </QueryClientProvider>
          </SessionProvider>
        </MetaProvider>
      )}
    >
      <FileRoutes />
    </Router>
  );
}

const WithStyling: ParentComponent = (props) => {
  const location = useLocation();
  return (
    <ErrorBoundary
      fallback={(err) => {
        return (
          <div class="text-xl sm:text-2xl font-bold text-red-500">
            {JSON.stringify(err, null, 2)}
          </div>
        );
      }}
    >
      <div
        class={`h-screen w-screen ${
          location.pathname === "/dashboard" ||
          location.pathname.startsWith("/contact")
            ? "py-[96px]"
            : "py-[180px]"
        }`}
      >
        {props.children}
      </div>
    </ErrorBoundary>
  );
};
