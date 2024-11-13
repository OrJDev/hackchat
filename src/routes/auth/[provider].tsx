import { useAuth } from "@solid-mediakit/auth/client";
import { Title } from "@solidjs/meta";
import { useNavigate, useParams } from "@solidjs/router";
import { createEffect, on, VoidComponent } from "solid-js";
import { capitalize } from "~/utils/string";

const AuthProvider: VoidComponent = () => {
  const params = useParams<{ provider: string }>();
  const auth = useAuth();
  const navigate = useNavigate();

  createEffect(
    on(auth.status, (status) => {
      if (params.provider !== "discord" && params.provider !== "github") {
        return navigate("/404");
      }
      if (status === "authenticated") {
        if (window.opener) {
          window.close();
        } else {
          navigate("/dashboard");
        }
      } else if (status === "unauthenticated") {
        void auth.signIn(params.provider);
      }
    })
  );

  const getText = () =>
    auth.status() === "loading"
      ? "Validating Your Request"
      : auth.status() === "unauthenticated"
      ? `Redirecting To ${capitalize(params.provider)}`
      : `Signing You In`;

  return (
    <>
      <Title>HackChat - {capitalize(params.provider)} Login</Title>
      <div class="h-full w-full flex items-center  flex-col gap-4">
        <div class="text-white text-2xl font-bold animate-pulse">
          {getText().split(" ")[0]}...
        </div>
        <p class="text-offwhite text-sm sm:text-lg font-medium">
          Please Wait While HackChat Is{" "}
          <span class="animate-pulse decoration-dotted underline decoration-purple-500">
            {getText()}
          </span>
        </p>
      </div>
    </>
  );
};

export default AuthProvider;
