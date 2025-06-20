import Image from "next/image";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="relative w-full flex flex-col h-screen">
      <div className="flex-1">
        <div className="flex min-h-screen w-full">
          <div className="hidden lg:flex lg:w-1/2 bg-muted border-r flex-col p-18">
            {/* <h1 className="text-xl font-semibold flex items-center gap-3">
              <Think />

              <span>SLYYYDE AI</span>
            </h1> */}
            <div className="flex items-center justify-center w-full text-black dark:text-white">
              <Image
                src={"/brand/slyyyde-logo.png"}
                alt="Slyyyde AI"
                width={1000}
                height={1000}
                className="w-fit object-cover transition-transform hover:scale-105 text-black"
                priority
              />
            </div>
            <div className="flex-1" />
            <p className=" mb-4 text-muted-foreground">
              Welcome to slyyyde AI Chat Bot. Sign in to experience our
              <span className="text-foreground ml-1">
                AI-powered conversational tools.
              </span>
            </p>
          </div>

          <div className="w-full lg:w-1/2 p-6">{children}</div>
        </div>
      </div>
    </main>
  );
}
