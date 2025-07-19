import { useAuth0 } from "@auth0/auth0-react";
import { useEffect } from "react";

const AuthSync = () => {
  const { user, getAccessTokenSilently, isAuthenticated } = useAuth0();

useEffect(() => {
  if (isAuthenticated && user?.email) {
    console.log("🔁 Sending user to backend:", user.email);
    const saveUserToBackend = async () => {
      const token = await getAccessTokenSilently();
      console.log("🔑 Token:", token);

      const res = await fetch("http://127.0.0.1:5000/api/save-user", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email: user.email })
      });

      const data = await res.json();
      console.log("🧾 Server response:", res.status, data);
    };

    saveUserToBackend();
  }
}, [user, isAuthenticated]);


  return null;
};

export default AuthSync;
