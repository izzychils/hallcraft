import { AuthScreen } from "@/features/auth/auth-screen";

export const metadata = { title: "Create your studio: Hallcraft" };

export default function SignUpPage() {
  return <AuthScreen mode="signup" />;
}
