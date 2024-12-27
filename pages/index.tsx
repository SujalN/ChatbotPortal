import styles from "../styles/Home.module.css";
import { signIn, useSession, signOut } from "next-auth/react";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

export default function Home() {
  const { data, status } = useSession();
  const [search, setSearch] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };
    window.addEventListener("resize", handleResize);
    handleResize(); 
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const onSignin = async () => {
    await signIn("azure-ad", { redirect: false }, { prompt: "login" });
  };

  const onSignout = async () => {
    await signOut({ redirect: false });
  };

  const chatbots = [
    {
      title: "BeiMed",
      description: "Answer questions based on documents in the KMS SharePoint library.",
      link: "https://kms-chat-webapp.azurewebsites.net/",
    },
    {
      title: "CBDi Alerts & IR Central",
      description:
        "Enhanced search and retrieval of email content and attachments from BeiGene CBDi Alerts and IR Central Sharepoint directories.",
      link: "https://cbdidemo.azurewebsites.net/",
    },
    {
      title: "CBDi Oncology",
      description:
        "Answer questions related to Oncology landscape and industry assessments.",
      link: "https://cbdi-oncology-chat-webapp.azurewebsites.net/",
    },
    {
      title: "ChatGPT Enterprise",
      description: "Query ChatGPT with enterprise-grade security and privacy.",
      link: "https://chatgpt.com/",
    },
    {
      title: "Compliance",
      description:
        "Answer questions related to BeiGene's company-wide policies and legal compliance",
      link: "https://legal-compliance-chatbot-web-app.azurewebsites.net/",
    },
    {
      title: "DSDI Country Intelligence",
      description:
        "Answer questions related to epidemiology and payer coverage analysis found in the Country Intelligence Chatbot directory",
      link: "https://country-intel-chatbot-web-app.azurewebsites.net/",
    },
    {
      title: "MyGPT",
      description: "Query an advanced LLM based on uploaded BeiGene documents.",
      link: "https://mygpt.beigene.com/",
    },
    {
      title: "StudyBuddy (BGB-HNSCC-201)",
      description:
        "Answer questions related to Clinical Operations protocols for the BGB-HNSCC-201 study.",
      link: "https://gcoumb-study-web-app.azurewebsites.net/",
    },
  ];

  const isAuthenticated = status === "authenticated" && data?.user;
  const userGroup = isAuthenticated ? 1 : null;

  let accessibleChatbots: string[] = [];
  if (userGroup === 1) {
    const shuffled = [...chatbots].sort(() => 0.5);
    accessibleChatbots = shuffled.slice(0, Math.ceil(chatbots.length / 2)).map(bot => bot.title);
  } else if (userGroup === 2) {
    accessibleChatbots = chatbots.map(bot => bot.title);
  }

  const filteredChatbots = chatbots.filter((bot) =>
    bot.title.toLowerCase().includes(search.toLowerCase())
  );

  const sortedChatbots = [...filteredChatbots].sort((a, b) => {
    const aAccessible = accessibleChatbots.includes(a.title);
    const bAccessible = accessibleChatbots.includes(b.title);
    if (aAccessible && !bAccessible) return -1;
    if (!aAccessible && bAccessible) return 1;
    return 0;
  });

  return (
    <div className={styles.container}>
      {isAuthenticated && isSidebarOpen && (
        <div className={styles.overlay} onClick={toggleSidebar}></div>
      )}

      {isAuthenticated && (
        <div className={`${styles.sidebar} ${isSidebarOpen ? styles.sidebarOpen : ""}`}>
          <div className={styles.userIconContainer}>
            {data.user.profile_image ? (
              <Image
                src={data.user.profile_image}
                alt="Profile Image"
                className={styles.userIcon}
                width={50}
                height={50}
              />
            ) : (
              <div className={styles.userIconPlaceholder}></div>
            )}
            <p className={styles.userName}>{data?.user?.name || "Guest"}</p>
          </div>
          <div className={styles.navLinks}>
            <Link href="/" className={styles.navLink}>Home</Link>
            <Link href="/chatbots" className={styles.navLink}>Chatbots</Link>
            <Link href="/settings" className={styles.navLink}>Settings</Link>
          </div>
          <div className={styles.authButtonContainer}>
            <button onClick={onSignout} className={styles.authButton}>Logout</button>
          </div>
        </div>
      )}

      <div className={`${styles.content} ${isSidebarOpen ? styles.contentShifted : ""}`}>
        <div className={styles.headerContainer}>
          {isAuthenticated ? (
            <>
              <button className={styles.sidebarToggle} onClick={toggleSidebar}>
                <span className={styles.sidebarToggleIcon}></span>
              </button>
              <h1>BeiGene AI Chatbot Portal</h1>
              <h2>Hello, {data?.user?.name}.</h2>
              <p>Select an Azure OpenAI chatbot or filter chatbots to continue.</p>

              <div className={styles.searchBarContainer}>
                <input
                  type="text"
                  placeholder="Search for chatbot"
                  className={styles.searchBar}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className={styles.cardGrid}>
                {sortedChatbots.length > 0 ? (
                  sortedChatbots.map((bot, index) => {
                    const canAccess = accessibleChatbots.includes(bot.title);
                    return (
                      <a
                        key={index}
                        href={canAccess ? bot.link : "#"}
                        target={canAccess ? "_blank" : "_self"}
                        rel="noopener noreferrer"
                        className={styles.card}
                        style={{ cursor: canAccess ? "pointer" : "not-allowed" }}
                      >
                        <h3>
                          {bot.title} {!canAccess && <span style={{ color: "red" }}>🔒</span>}
                        </h3>
                        <p>{bot.description}</p>
                      </a>
                    );
                  })
                ) : (
                  <div className={styles.noResults}>No results found</div>
                )}
              </div>

            </>
          ) : (
            <>
              <h1>BeiGene AI Chatbot Portal</h1>
              <p>Please log in to access the chatbots.</p>
              <button onClick={onSignin} className={styles.authButton}>
                Login
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
