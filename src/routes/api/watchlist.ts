import { json } from "@solidjs/router";
import { APIHandler } from "@solidjs/start/server";
import { getServerSession } from "~/server/auth";
import { pusher } from "~/server/pusher";

export const POST: APIHandler = async (event) => {
  try {
    const body = await event.request.text();
    const socketId = body?.split("socket_id=")[1];

    if (!socketId) {
      return json({ error: "Something went wrong" });
    }

    const session = await getServerSession(event);
    if (!session?.user) {
      return json({ error: "Unknown User" });
    }
    console.log(
      `The watchlist for ${session.user.name} is, ${session.user.contacts
        .map((e) => e.user.name)
        .join(", ")}`
    );
    const authResponse = pusher.authenticateUser(socketId, {
      id: session.user.id,
      watchlist: session.user.contacts.map((e) => e.user.id),
    });
    return json(authResponse);
  } catch (e) {
    console.error("@watchlist", e);
    return json({ error: e });
  }
};
