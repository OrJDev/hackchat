import Pusher from "pusher";
import { serverEnv } from "~/env/server";
import type { Events } from "~/utils/events";

export const pusher = new Pusher({
  appId: serverEnv.PUSHER_APP_ID,
  key: import.meta.env.VITE_PUSHER_APP_KEY,
  secret: serverEnv.PUSHER_APP_SECRET,
  cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER,
  useTLS: serverEnv.NODE_ENV === "production",
});

export const trigger = async <N extends keyof Events>(
  userId: string,
  name: N,
  data: Events[N]
) => {
  return await pusher.trigger(userId, name, data);
};
