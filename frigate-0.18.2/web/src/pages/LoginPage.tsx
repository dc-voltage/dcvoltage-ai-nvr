import { UserAuthForm } from "@/components/auth/AuthForm";
import Logo from "@/components/Logo";
import { ThemeProvider } from "@/context/theme-provider";
import "@/utils/i18n";
import { LanguageProvider } from "@/context/language-provider";

function LoginPage() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="frigate-ui-theme">
      <LanguageProvider>
        <div className="size-full overflow-hidden">
          <div className="p-8">
            <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[380px]">
              <div className="flex flex-col items-center space-y-2 text-center">
                <Logo className="mb-2 h-16 w-16" />
                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                  DC VOLTAGE AI NVR
                </h1>
                <p className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                  Intelligent Surveillance. Zero Blind Spots.
                </p>
                <span className="rounded-full bg-primary/10 px-3 py-0.5 text-[11px] font-medium text-primary">
                  DC VOLTAGE NETWORK
                </span>
              </div>
              <UserAuthForm />
            </div>
          </div>
        </div>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default LoginPage;
