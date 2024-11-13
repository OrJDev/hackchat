// @refresh reload
import "./app.css";
import { MetaProvider, Title } from "@solidjs/meta";
import { Router } from "@solidjs/router";
import { FileRoutes } from "@solidjs/start/router";
import { Suspense } from "solid-js";
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
          <Title>HackChat</Title>
          <SessionProvider>
            <QueryClientProvider client={queryClient}>
              <Suspense>
                <NavBar />
                <div class="h-screen w-screen py-[180px]">{props.children}</div>
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
