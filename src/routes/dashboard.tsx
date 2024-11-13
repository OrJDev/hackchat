import { useAuth } from "@solid-mediakit/auth/client";
import { Title } from "@solidjs/meta";
import { VoidComponent } from "solid-js";

const Dashboard: VoidComponent = () => {
  const auth = useAuth();

  return (
    <>
      <Title>HackChat - Dashboard</Title>
      <main class="flex flex-col gap-2 items-center justify-center">
        <h1 class="font-bold text-2xl text-offwhite">
          Hey {auth.session()?.user.name}
        </h1>
      </main>
    </>
  );
};

export default Dashboard;
