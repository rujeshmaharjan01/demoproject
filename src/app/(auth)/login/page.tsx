import { CardContent, CardHeader } from "@/components/ui/card";
import { LoginForm } from "@/components/web/auth/LoginForm";

const Page = () => {
  return (
    <>
      <CardHeader>
        <h1>This is login page</h1>
      </CardHeader>
      <CardContent>
        <LoginForm />
      </CardContent>
    </>
  );
};

export default Page;
