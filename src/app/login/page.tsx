import { AuthScreen } from "@/features/auth/auth-screen";

export const metadata = { title: "Sign in: Hallcraft" };

export default function LoginPage() {
  return <AuthScreen mode="login" />;
}
