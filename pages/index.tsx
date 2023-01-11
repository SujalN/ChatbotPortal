import styles from "../styles/Home.module.css";
import { signIn, useSession, signOut } from "next-auth/react";

export default function Home() {
  const { data, status } = useSession();

  const onSignin = async () => {
    await signIn(
      "azure-ad",
      { redirect: false },
      {
        prompt: "login",
      }
    );
  };

  const onSignout = async () => {
    await signOut({ redirect: false });
  };

  return (
    <div className={styles.container}>
      {status === "loading" ? (
        <h1>Loading.....</h1>
      ) : (
        <>
          {data?.user ? (
            <h1>
              Logged in as {data?.user?.name} ({data?.user?.email})
            </h1>
          ) : (
            <h1>Not logged in</h1>
          )}
          <br />
          {data?.user ? (
            <button onClick={onSignout}>Logout</button>
          ) : (
            <button onClick={onSignin}>Login</button>
          )}
        </>
      )}
    </div>
  );
}
