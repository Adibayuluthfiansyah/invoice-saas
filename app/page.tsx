import LoginPage from "./(auth)/login/page";

export default async function Home() {
  return (
    <div className="min-h-screen justify-center items-center">
      <div className="grid gap-4">
        <LoginPage />
      </div>
    </div>
  );
}
