import { Card } from "@/components/ui/card";

const AuthLayout = ({ children }: LayoutProps<"/">) => {
  return (
    <div
     className="flex h-screen items-center justify-center"
     >
      <Card className="min-w-125" >{children}</Card>
    </div>
  );
};

export default AuthLayout;
