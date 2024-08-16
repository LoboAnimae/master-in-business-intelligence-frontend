"use client"
import { Container, createTheme, ThemeProvider } from "@mui/material"
import { AppRouterCacheProvider } from "@mui/material-nextjs/v14-appRouter"
import { LocalizationProvider } from "@mui/x-date-pickers"
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { Inter } from "next/font/google"
import "./globals.css"
const inter = Inter({ subsets: ["latin"] })

const theme = createTheme({
  palette: {
    primary: {
      main: "#153658",
    },
  },
})

const queryClient = new QueryClient()
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <QueryClientProvider client={queryClient}>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <ThemeProvider theme={theme}>
              <AppRouterCacheProvider>
                <Container className="min-h-screen h-screen max-h-screen p-0 bg-white">
                  {children}
                </Container>
              </AppRouterCacheProvider>
            </ThemeProvider>
          </LocalizationProvider>
        </QueryClientProvider>
      </body>
    </html>
  )
}
