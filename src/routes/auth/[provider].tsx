import { useAuth } from "@solid-mediakit/auth/client";
import { useNavigate, useParams } from "@solidjs/router";
import { createEffect, on, VoidComponent } from "solid-js";
import { assertProtected, getUserAndRedirect } from "~/utils/user";

export const route = {
  preload: async () => await getUserAndRedirect(),
};

const AuthProvider: VoidComponent = () => {
  assertProtected();
  const params = useParams();
  const auth = useAuth();
  const navigate = useNavigate();

  createEffect(
    on(auth.status, (status) => {
      if (params.provider !== "discord" && params.provider !== "github") {
        return navigate("/404");
      }
      if (status === "authenticated") {
        window.close();
      } else if (status === "unauthenticated") {
        void auth.signIn(params.provider);
      }
    })
  );

  return (
    <div class="h-full w-full flex items-center justify-center flex-col gap-4">
      <div class="text-white text-2xl font-bold animate-pulse">
        Redirecting...
      </div>
      <p class="text-offwhite text-lg font-medium">
        Please Wait While HackChat Is Validating Your Request
      </p>
    </div>
  );
};

export default AuthProvider;
