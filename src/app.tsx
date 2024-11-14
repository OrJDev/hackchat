// @refresh reload
import "./styles/app.css";
import { Meta, MetaProvider, Title } from "@solidjs/meta";
import { Router, useLocation } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { ParentComponent, Suspense } from "solid-js";
import { QueryClient, QueryClientProvider } from "@tanstack/solid-query";
import { SessionProvider } from "@solid-mediakit/auth/client";
import { Toaster } from "solid-toast";
import { NavBar } from "./components";

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
          <Title>HackChat</Title>
          <SessionProvider>
            <QueryClientProvider client={queryClient}>
              <Suspense>
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
    <div
      class={`h-screen w-screen ${
        location.pathname === "/dashboard" ? "py-[96px]" : "py-[180px]"
      }`}
    >
      {props.children}
    </div>
  );
};
