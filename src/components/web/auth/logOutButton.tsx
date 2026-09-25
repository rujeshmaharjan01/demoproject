"use client";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

export const LogOutButton = () => {

const router = useRouter()

  const handelClick = async () => {
    authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/login");
        },
      },
    });
  };

  return (
    <div>
      <Button onClick={() => handelClick()}>lgoOut</Button>
    </div>
  );
};
