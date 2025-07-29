import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://mhovvdebtpinmcqhyahw.supabase.co/";
const supabaseKey = "sb_publishable_O486ikcK_pFTdxn-Bf0fFw_95fcL_sP";
const supabase = createClient(supabaseUrl, supabaseKey);

export const Notifications: React.FC = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [show, setShow] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id ?? null);
    });
  }, []);

  // Fetch notifications and actor profiles
  const fetchNotificationsAndActors = async () => {
    const { data: notifications } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(20);

    if (!notifications || notifications.length === 0) {
      setNotifications([]);
      return;
    }

    const actorIds = notifications.map((n: any) => n.actor_id).filter(Boolean);
    const { data: profiles } = await supabase
      .from("profile")
      .select("user_id, name, profile_pic_url")
      .in("user_id", actorIds);

    const profilesById: Record<string, any> = {};
    (profiles ?? []).forEach((p: any) => {
      profilesById[p.user_id] = p;
    });

    const notificationsWithActors = notifications.map((n: any) => ({
      ...n,
      actor: profilesById[n.actor_id] || { user_id: n.actor_id, name: n.actor_id }
    }));

    setNotifications(notificationsWithActors);
  };

  useEffect(() => {
    if (!userId) return;
    fetchNotificationsAndActors();
    // eslint-disable-next-line
  }, [userId]);

  // Mark all unread notifications as read when the bell is opened
  const handleBellClick = async () => {
    if (!show && userId && notifications.some(n => !n.read)) {
      await supabase
        .from("notifications")
        .update({ read: true })
        .eq("user_id", userId)
        .eq("read", false);
      // Optionally, refresh notifications after marking as read
      fetchNotificationsAndActors();
    }
    setShow(!show);
  };

  const renderNotificationMessage = (n: any) => {
    const actorName = n.actor?.name?.trim() ? n.actor.name : n.actor?.user_id || n.actor_id;
    return (
      <>
        <Link
          to={`/profile/${n.actor?.user_id || n.actor_id}`}
          className="font-bold hover:underline text-blue-700"
        >
          {actorName}
        </Link>{" "}
        started following you.
      </>
    );
  };

  return (
    <div className="relative inline-block mr-4">
      <button
        onClick={handleBellClick}
        className="relative"
        aria-label="Notifications"
      >
        <span role="img" aria-label="bell" className="text-2xl">🔔</span>
        {notifications.some(n => !n.read) && (
          <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
        )}
      </button>
      {show && (
        <div className="absolute right-0 mt-2 w-80 bg-white border rounded shadow-lg z-50 p-2">
          <h3 className="font-semibold mb-2">Notifications</h3>
          {notifications.length === 0 ? (
            <div className="text-gray-500">No notifications.</div>
          ) : (
            <ul>
              {notifications.map(n => (
                <li
                  key={n.id}
                  className={`mb-2 border-b pb-2 last:border-b-0 last:pb-0 ${n.read ? "bg-gray-100" : "bg-white"}`}
                >
                  {renderNotificationMessage(n)}
                  <span className="block text-xs text-gray-400">
                    {new Date(n.created_at).toLocaleString()}
                    {!n.read && (
                      <span className="ml-2 px-2 py-0.5 bg-red-100 text-red-800 rounded-full text-xxs align-middle">
                        New
                      </span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};
