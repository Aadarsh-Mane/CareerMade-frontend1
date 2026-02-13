"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Bell, LogOut, Menu, User, X } from "lucide-react";
import Image from "next/image";

type UserRole = "employer" | "jobseeker";

type StoredUser = {
  firstName?: string;
  lastName?: string;
  role?: UserRole;
};

type PathRule = {
  path: string;
  exact?: boolean;
};

type NavItem = {
  label: string;
  path: string;
  matches: PathRule[];
};

const USER_KEY = "user";
const TOKEN_KEY = "accessToken";

function parseStoredUser(rawUser: string | null): StoredUser | null {
  if (!rawUser) return null;

  try {
    const parsed = JSON.parse(rawUser) as StoredUser;
    if (!parsed || typeof parsed !== "object") return null;
    return parsed;
  } catch {
    return null;
  }
}

function matchesPathname(pathname: string, rule: PathRule): boolean {
  if (rule.exact) {
    return pathname === rule.path;
  }

  return pathname === rule.path || pathname.startsWith(`${rule.path}/`);
}

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();

  const [user, setUser] = useState<StoredUser | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileCompletion, setProfileCompletion] = useState<number | null>(null);

  const mobileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setUser(parseStoredUser(localStorage.getItem(USER_KEY)));
  }, []);

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key === USER_KEY) {
        setUser(parseStoredUser(event.newValue));
      }
    };

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    const fetchProfileCompletion = async () => {
      if (user?.role !== "jobseeker") {
        setProfileCompletion(null);
        return;
      }

      const token = localStorage.getItem(TOKEN_KEY);
      if (!token) return;

      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/jobseeker/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        const completion = data?.data?.jobSeeker?.profileCompletion;
        if (typeof completion === "number") setProfileCompletion(completion);
      } catch {
        setProfileCompletion(null);
      }
    };

    fetchProfileCompletion();
  }, [user?.role, pathname]);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setMobileMenuOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileMenuOpen(false);
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const navigate = (path: string) => {
    router.push(path);
    setMobileMenuOpen(false);
  };

  const profilePath = useMemo(() => {
    if (user?.role === "employer") return "/dashboard/employee/profile";
    if (user?.role === "jobseeker") return "/dashboard/jobseeker/profile";
    return "/login";
  }, [user?.role]);

  const handleLogout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setUser(null);
    setProfileCompletion(null);
    navigate("/login");
  };

  const userDisplayName = user?.firstName
    ? `${user.firstName} ${user.lastName ?? ""}`.trim()
    : "Guest User";

  const navItems: NavItem[] = useMemo(() => {
    if (user?.role === "jobseeker") {
      return [
        { label: "Home", path: "/", matches: [{ path: "/", exact: true }] },
        {
          label: "Jobs",
          path: "/dashboard/jobseeker",
          matches: [
            { path: "/dashboard/jobseeker", exact: true },
            { path: "/dashboard/jobseeker/jobs" },
          ],
        },
        {
          label: "Employers",
          path: "/dashboard/jobseeker/employers",
          matches: [{ path: "/dashboard/jobseeker/employers" }],
        },
        {
          label: "My Applications",
          path: "/dashboard/jobseeker/applications",
          matches: [{ path: "/dashboard/jobseeker/applications" }],
        },
        {
          label: "Saved Jobs",
          path: "/dashboard/jobseeker/bookmarks",
          matches: [{ path: "/dashboard/jobseeker/bookmarks" }],
        },
        {
          label: "Resume",
          path: "/dashboard/jobseeker/resume",
          matches: [{ path: "/dashboard/jobseeker/resume" }],
        },
        {
          label: "Profile",
          path: "/dashboard/jobseeker/profile",
          matches: [{ path: "/dashboard/jobseeker/profile" }],
        },
      ];
    }

    if (user?.role === "employer") {
      return [
        { label: "Home", path: "/", matches: [{ path: "/", exact: true }] },
        {
          label: "My Job Postings",
          path: "/dashboard/employee/jobs",
          matches: [{ path: "/dashboard/employee/jobs" }],
        },
        {
          label: "Create Job",
          path: "/dashboard/employee/jobs/create",
          matches: [{ path: "/dashboard/employee/jobs/create" }],
        },
        {
          label: "Profile",
          path: "/dashboard/employee/profile",
          matches: [{ path: "/dashboard/employee/profile" }],
        },
      ];
    }

    return [
      { label: "Home", path: "/", matches: [{ path: "/", exact: true }] },
      { label: "Jobs", path: "/login", matches: [{ path: "/login" }] },
      { label: "Employers", path: "/login", matches: [{ path: "/login" }] },
      { label: "My Applications", path: "/login", matches: [{ path: "/login" }] },
      { label: "Saved Jobs", path: "/login", matches: [{ path: "/login" }] },
      { label: "Resume", path: "/login", matches: [{ path: "/login" }] },
      { label: "Profile", path: "/login", matches: [{ path: "/login" }] },
    ];
  }, [user?.role]);

  const isActive = (item: NavItem) => {
    return item.matches.some((rule) => matchesPathname(pathname, rule));
  };

  return (
    <motion.header
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.45 }}
      className="sticky top-0 z-50 border-b border-gray-200 bg-white"
    >
      <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2 lg:gap-4">
            <motion.button
              type="button"
              className="flex items-center"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate("/")}
              aria-label="Go to home"
            >
              <Image src="/logo.png" alt="CareerMade" width={140} height={32} priority />
            </motion.button>

            <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary navigation">
              {navItems.map((item) => (
                <button
                  key={item.label}
                  onClick={() => navigate(item.path)}
                  className={`whitespace-nowrap rounded-md px-2 py-2 text-sm font-medium transition xl:px-3 ${
                    isActive(item)
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-700 hover:bg-gray-50 hover:text-blue-600"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="hidden items-center gap-1 sm:gap-2 lg:flex">
            {user ? (
              <>
                {user.role === "jobseeker" && (
                  <button
                    onClick={() => navigate("/dashboard/jobseeker/resume")}
                    className="flex h-9 items-center justify-center gap-1 rounded-md px-2 text-sm font-medium text-gray-800 transition hover:bg-gray-100"
                    aria-label="Open InstantCV"
                  >
                    <Image src="/star.png" alt="InstantCV" width={16} height={16} />
                    <span>InstantCV</span>
                  </button>
                )}

                <button
                  type="button"
                  className="flex h-9 w-9 items-center justify-center rounded-md text-gray-700 transition hover:bg-gray-100"
                  aria-label="Notifications"
                >
                  <Bell size={18} />
                </button>

                
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="rounded-md px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 hover:text-blue-600"
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
                >
                  Login
                </button>
              </>
            )}
          </div>

          <div className="flex items-center gap-2 lg:hidden">
            {user?.role === "jobseeker" && (
              <button
                onClick={() => navigate("/dashboard/jobseeker/resume")}
                className="flex h-9 items-center justify-center gap-1 rounded-md px-2 text-sm font-medium text-gray-800 transition hover:bg-gray-100"
                aria-label="Open InstantCV"
              >
                <Image src="/star.png" alt="InstantCV" width={16} height={16} />
                <span className="hidden sm:inline">InstantCV</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="flex h-9 w-9 items-center justify-center rounded-md text-gray-700 transition hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              aria-expanded={mobileMenuOpen}
              aria-haspopup="dialog"
              aria-label="Open menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {user?.role === "jobseeker" &&
        typeof profileCompletion === "number" &&
        profileCompletion < 100 && (
          <div className="border-t bg-blue-50/70">
            <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-2 sm:px-6 lg:px-8">
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-blue-900 sm:text-sm">
                  Profile Completion: {profileCompletion}%
                </p>
                <div className="mt-1 h-1.5 w-full rounded-full bg-blue-100">
                  <div
                    className="h-1.5 rounded-full bg-blue-600 transition-all"
                    style={{ width: `${Math.max(0, Math.min(profileCompletion, 100))}%` }}
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={() => navigate("/dashboard/jobseeker/profile/create")}
                className="shrink-0 rounded-md bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-blue-700 sm:text-sm"
              >
                Complete Profile
              </button>
            </div>
          </div>
        )}

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-[60] bg-black/30 lg:hidden"
          >
            <motion.div
              ref={mobileMenuRef}
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 top-0 h-full w-[min(22rem,88vw)] overflow-y-auto bg-white p-4 shadow-2xl"
              role="dialog"
              aria-label="Mobile navigation menu"
            >
              <div className="mb-4 flex items-center justify-between border-b pb-3">
                <div>
                  <p className="text-sm text-gray-500">Signed in as</p>
                  <p className="max-w-[12rem] truncate font-semibold text-gray-900">{userDisplayName}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-md p-1 text-gray-600 hover:bg-gray-100"
                  aria-label="Close menu"
                >
                  <X size={18} />
                </button>
              </div>

              <nav className="flex flex-col gap-1" aria-label="Mobile navigation">
                {navItems.map((item) => (
                  <button
                    key={`mobile-${item.label}`}
                    onClick={() => navigate(item.path)}
                    className={`rounded-md px-3 py-2 text-left text-sm font-medium transition ${
                      isActive(item)
                        ? "bg-blue-50 text-blue-700"
                        : "text-gray-700 hover:bg-gray-50 hover:text-blue-600"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </nav>

              <div className="mt-4 border-t pt-3">
                {user ? (
                  <>
                    

                    <button
                      type="button"
                      className="mt-1 flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-gray-700 transition hover:bg-gray-50 hover:text-blue-600"
                    >
                      <Bell size={16} />
                      <span>Notifications</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="mt-1 flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-red-500 transition hover:bg-red-50 hover:text-red-600"
                    >
                      <LogOut size={16} />
                      <span>Logout</span>
                    </button>
                  </>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => navigate("/login")}
                      className="rounded-md px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 hover:text-blue-600"
                    >
                      Sign In
                    </button>
                    <button
                      type="button"
                      onClick={() => navigate("/login")}
                      className="rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
                    >
                      Login
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
