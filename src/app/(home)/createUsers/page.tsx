// src/app/(dashboard)/users/create/page.tsx  (adjust path)
import CreateUserForm from "@/components/web/forms/createUserForm";

const Page = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-6">
      <h1 className="text-2xl font-semibold">Create user</h1>
      <CreateUserForm />
    </div>
  );
};

export default Page;