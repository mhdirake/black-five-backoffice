import '@/assets/css/general.css';
import 'react-toastify/dist/ReactToastify.css';

import AuthSessionProvider from '@/components/AuthSessionProvider';
import LocalizationProvider from '@/context/LocalizationProvider';
import StoreProvider from '@/context/StoreProvider';
import ThemeSwitcherContextProvider from '@/context/ThemeSwitcherContextProvider';
import { DEFAULT_LOCALE, LOCALE_COOKIE, getDirection, isLocale } from '@/localization/config';

import { cookies } from 'next/headers';
import { ToastContainer } from 'react-toastify';

export const metadata = {
  title: 'Black Five | بک‌آفیس',
  description: 'پنل مدیریت بلک فایو',
};

export default async function RootLayout({ children }) {
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get(LOCALE_COOKIE)?.value;
  const locale = isLocale(cookieLocale) ? cookieLocale : DEFAULT_LOCALE;
  const direction = getDirection(locale);

  return (
    <html lang={locale} dir={direction}>
      <body>
        <ToastContainer
          position={direction === 'rtl' ? 'top-left' : 'top-right'}
          rtl={direction === 'rtl'}
          className={'toast-custom-style'}
        />
        <StoreProvider>
          <LocalizationProvider initialLocale={locale}>
            <AuthSessionProvider>
              <ThemeSwitcherContextProvider>
                {children}
              </ThemeSwitcherContextProvider>
            </AuthSessionProvider>
          </LocalizationProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
