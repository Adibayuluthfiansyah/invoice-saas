export async function GET() {
  const env = {
    NODE_ENV: process.env.NODE_ENV,
    DATABASE_URL: process.env.DATABASE_URL ? '✅ SET' : '❌ NOT SET',
    PORT: process.env.PORT,
    WEBSITES_PORT: process.env.WEBSITES_PORT,
  }
  
  return Response.json(env)
}